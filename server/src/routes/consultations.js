const express = require("express");
const { db, ensureBillingForConsultation } = require("../db");

const router = express.Router();

function validateConsultationPayload(body) {
  const appointmentId = Number(body.appointment_id);
  const consultationDate = String(body.consultation_date ?? "").trim();
  const doctorNotes = String(body.doctor_notes ?? "").trim();

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return "Appointment selection is required.";
  }

  if (!consultationDate) return "Consultation date is required.";
  if (!doctorNotes) return "Doctor notes are required.";

  return null;
}

router.get("/available-appointments", (_req, res) => {
  const appointments = db
    .prepare(`
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        p.full_name AS patient_name,
        d.full_name AS doctor_name,
        d.specialization
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN consultations c ON c.appointment_id = a.id
      WHERE c.id IS NULL
        AND a.status != 'cancelled'
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `)
    .all();

  res.json(appointments);
});

router.get("/", (_req, res) => {
  const consultations = db
    .prepare(`
      SELECT
        c.*,
        p.full_name AS patient_name,
        d.full_name AS doctor_name,
        d.specialization,
        a.appointment_date,
        a.appointment_time,
        b.id AS bill_id,
        b.status AS bill_status
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN doctors d ON d.id = c.doctor_id
      JOIN appointments a ON a.id = c.appointment_id
      LEFT JOIN billing b ON b.consultation_id = c.id
      ORDER BY c.consultation_date DESC, c.created_at DESC
    `)
    .all();

  res.json(consultations);
});

router.post("/", (req, res) => {
  const validationError = validateConsultationPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const appointmentId = Number(req.body.appointment_id);
  const appointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(appointmentId);

  if (!appointment) {
    return res.status(400).json({ error: "Selected appointment does not exist." });
  }

  const existingConsultation = db
    .prepare("SELECT id FROM consultations WHERE appointment_id = ?")
    .get(appointmentId);

  if (existingConsultation) {
    return res.status(409).json({
      error: "A consultation already exists for this appointment. Please edit the existing note.",
    });
  }

  const createConsultation = db.transaction(() => {
    const result = db
      .prepare(`
        INSERT INTO consultations (appointment_id, patient_id, doctor_id, consultation_date, doctor_notes)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        appointmentId,
        appointment.patient_id,
        appointment.doctor_id,
        String(req.body.consultation_date).trim(),
        String(req.body.doctor_notes).trim(),
      );

    db.prepare("UPDATE appointments SET status = 'completed' WHERE id = ?").run(appointmentId);
    ensureBillingForConsultation(result.lastInsertRowid, appointment.patient_id);

    return result.lastInsertRowid;
  });

  const consultationId = createConsultation();
  const consultation = db
    .prepare(`
      SELECT
        c.*,
        p.full_name AS patient_name,
        d.full_name AS doctor_name,
        d.specialization
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN doctors d ON d.id = c.doctor_id
      WHERE c.id = ?
    `)
    .get(consultationId);

  res.status(201).json(consultation);
});

router.put("/:id", (req, res) => {
  const consultationId = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM consultations WHERE id = ?").get(consultationId);

  if (!existing) return res.status(404).json({ error: "Consultation not found." });

  const validationError = validateConsultationPayload({
    ...req.body,
    appointment_id: existing.appointment_id,
  });
  if (validationError) return res.status(400).json({ error: validationError });

  db.prepare(`
    UPDATE consultations
    SET consultation_date = ?, doctor_notes = ?
    WHERE id = ?
  `).run(
    String(req.body.consultation_date).trim(),
    String(req.body.doctor_notes).trim(),
    consultationId,
  );

  const consultation = db
    .prepare(`
      SELECT
        c.*,
        p.full_name AS patient_name,
        d.full_name AS doctor_name,
        d.specialization
      FROM consultations c
      JOIN patients p ON p.id = c.patient_id
      JOIN doctors d ON d.id = c.doctor_id
      WHERE c.id = ?
    `)
    .get(consultationId);

  res.json(consultation);
});

module.exports = router;
