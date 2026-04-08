const express = require("express");
const { db } = require("../db");

const router = express.Router();

function validateDoctorPayload(body) {
  const fullName = String(body.full_name ?? "").trim();
  const specialization = String(body.specialization ?? "").trim();

  if (!fullName) return "Full name is required.";
  if (!specialization) return "Specialization is required.";

  return null;
}

router.get("/", (_req, res) => {
  const doctors = db
    .prepare(`
      SELECT
        d.*,
        COUNT(DISTINCT a.id) AS appointment_count,
        COUNT(DISTINCT c.id) AS consultation_count
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id = d.id
      LEFT JOIN consultations c ON c.doctor_id = d.id
      GROUP BY d.id
      ORDER BY d.full_name ASC
    `)
    .all();

  res.json(doctors);
});

router.post("/", (req, res) => {
  const validationError = validateDoctorPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const result = db
    .prepare("INSERT INTO doctors (full_name, specialization) VALUES (?, ?)")
    .run(String(req.body.full_name).trim(), String(req.body.specialization).trim());

  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(doctor);
});

router.put("/:id", (req, res) => {
  const doctorId = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM doctors WHERE id = ?").get(doctorId);

  if (!existing) return res.status(404).json({ error: "Doctor not found." });

  const validationError = validateDoctorPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  db.prepare(`
    UPDATE doctors
    SET full_name = ?, specialization = ?
    WHERE id = ?
  `).run(String(req.body.full_name).trim(), String(req.body.specialization).trim(), doctorId);

  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
  res.json(doctor);
});

router.delete("/:id", (req, res) => {
  const doctorId = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM doctors WHERE id = ?").get(doctorId);

  if (!existing) return res.status(404).json({ error: "Doctor not found." });

  const linked = db
    .prepare(`
      SELECT
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = ?) AS appointments,
        (SELECT COUNT(*) FROM consultations WHERE doctor_id = ?) AS consultations
    `)
    .get(doctorId, doctorId);

  if (linked.appointments || linked.consultations) {
    return res.status(400).json({
      error: "This doctor has linked appointments or consultations and cannot be deleted.",
    });
  }

  db.prepare("DELETE FROM doctors WHERE id = ?").run(doctorId);
  res.status(204).send();
});

module.exports = router;
