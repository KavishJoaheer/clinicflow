const express = require("express");
const { db } = require("../db");
const { toPagination } = require("../lib/utils");

const router = express.Router();

function validatePatientPayload(body) {
  const fullName = String(body.full_name ?? "").trim();
  const age = Number(body.age);
  const contactNumber = String(body.contact_number ?? "").trim();
  const address = String(body.address ?? "").trim();

  if (!fullName) return "Full name is required.";
  if (!Number.isInteger(age) || age < 0) return "Age must be a valid non-negative number.";
  if (!contactNumber) return "Contact number is required.";
  if (!address) return "Address is required.";

  return null;
}

router.get("/options", (_req, res) => {
  const patients = db
    .prepare("SELECT id, full_name FROM patients ORDER BY full_name ASC")
    .all();

  res.json(patients);
});

router.get("/", (req, res) => {
  const search = String(req.query.search ?? "").trim();
  const searchTerm = `%${search}%`;
  const { page, limit, offset } = toPagination(req.query.page, req.query.limit, 8);

  const filters = { search, searchTerm };

  const total = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM patients
      WHERE @search = ''
        OR full_name LIKE @searchTerm
        OR contact_number LIKE @searchTerm
        OR address LIKE @searchTerm
    `)
    .get(filters).count;

  const patients = db
    .prepare(`
      SELECT
        p.*,
        COUNT(DISTINCT a.id) AS appointment_count,
        COUNT(DISTINCT c.id) AS consultation_count,
        COUNT(DISTINCT b.id) AS bill_count
      FROM patients p
      LEFT JOIN appointments a ON a.patient_id = p.id
      LEFT JOIN consultations c ON c.patient_id = p.id
      LEFT JOIN billing b ON b.patient_id = p.id
      WHERE @search = ''
        OR p.full_name LIKE @searchTerm
        OR p.contact_number LIKE @searchTerm
        OR p.address LIKE @searchTerm
      GROUP BY p.id
      ORDER BY p.created_at DESC, p.full_name ASC
      LIMIT @limit OFFSET @offset
    `)
    .all({ ...filters, limit, offset });

  res.json({
    items: patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.get("/:id", (req, res) => {
  const patientId = Number(req.params.id);
  const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(patientId);

  if (!patient) {
    return res.status(404).json({ error: "Patient not found." });
  }

  const appointments = db
    .prepare(`
      SELECT
        a.*,
        d.full_name AS doctor_name,
        d.specialization,
        c.id AS consultation_id
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN consultations c ON c.appointment_id = a.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `)
    .all(patientId);

  const consultations = db
    .prepare(`
      SELECT
        c.*,
        d.full_name AS doctor_name,
        d.specialization,
        a.appointment_date,
        a.appointment_time
      FROM consultations c
      JOIN doctors d ON d.id = c.doctor_id
      JOIN appointments a ON a.id = c.appointment_id
      WHERE c.patient_id = ?
      ORDER BY c.consultation_date DESC, c.created_at DESC
    `)
    .all(patientId);

  const bills = db
    .prepare(`
      SELECT
        b.*,
        c.consultation_date,
        d.full_name AS doctor_name
      FROM billing b
      JOIN consultations c ON c.id = b.consultation_id
      JOIN doctors d ON d.id = c.doctor_id
      WHERE b.patient_id = ?
      ORDER BY b.created_at DESC
    `)
    .all(patientId)
    .map((bill) => ({
      ...bill,
      items: JSON.parse(bill.items),
    }));

  res.json({ patient, appointments, consultations, bills });
});

router.post("/", (req, res) => {
  const validationError = validatePatientPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const result = db
    .prepare(`
      INSERT INTO patients (full_name, age, contact_number, address)
      VALUES (?, ?, ?, ?)
    `)
    .run(
      String(req.body.full_name).trim(),
      Number(req.body.age),
      String(req.body.contact_number).trim(),
      String(req.body.address).trim(),
    );

  const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(patient);
});

router.put("/:id", (req, res) => {
  const patientId = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM patients WHERE id = ?").get(patientId);

  if (!existing) return res.status(404).json({ error: "Patient not found." });

  const validationError = validatePatientPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  db.prepare(`
    UPDATE patients
    SET full_name = ?, age = ?, contact_number = ?, address = ?
    WHERE id = ?
  `).run(
    String(req.body.full_name).trim(),
    Number(req.body.age),
    String(req.body.contact_number).trim(),
    String(req.body.address).trim(),
    patientId,
  );

  const updated = db.prepare("SELECT * FROM patients WHERE id = ?").get(patientId);
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const patientId = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM patients WHERE id = ?").get(patientId);

  if (!existing) return res.status(404).json({ error: "Patient not found." });

  const relationCounts = db
    .prepare(`
      SELECT
        (SELECT COUNT(*) FROM appointments WHERE patient_id = ?) AS appointments,
        (SELECT COUNT(*) FROM consultations WHERE patient_id = ?) AS consultations,
        (SELECT COUNT(*) FROM billing WHERE patient_id = ?) AS bills
    `)
    .get(patientId, patientId, patientId);

  if (relationCounts.appointments || relationCounts.consultations || relationCounts.bills) {
    return res.status(400).json({
      error: "This patient has linked clinical records and cannot be deleted.",
    });
  }

  db.prepare("DELETE FROM patients WHERE id = ?").run(patientId);
  res.status(204).send();
});

module.exports = router;
