const express = require("express");
const { db } = require("../db");
const { getTodayLocal, offsetLocalDate, toNumber } = require("../lib/utils");

const router = express.Router();

router.get("/", (_req, res) => {
  const today = getTodayLocal();
  const nextWeek = offsetLocalDate(7);

  const totalPatients = db.prepare("SELECT COUNT(*) AS count FROM patients").get().count;
  const todaysAppointments = db
    .prepare("SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = ?")
    .get(today).count;
  const pendingBills = db
    .prepare("SELECT COUNT(*) AS count FROM billing WHERE status = 'unpaid'")
    .get().count;
  const revenueRow = db
    .prepare("SELECT COALESCE(SUM(total_amount), 0) AS total FROM billing WHERE status = 'paid'")
    .get();

  const upcomingAppointments = db
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
      WHERE a.appointment_date BETWEEN ? AND ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 10
    `)
    .all(today, nextWeek);

  const recentActivity = db
    .prepare(`
      SELECT * FROM (
        SELECT
          'appointment' AS type,
          a.created_at AS activity_at,
          CASE
            WHEN a.status = 'completed' THEN 'Appointment completed'
            WHEN a.status = 'cancelled' THEN 'Appointment cancelled'
            ELSE 'Appointment scheduled'
          END AS title,
          p.full_name AS patient_name,
          d.full_name AS doctor_name,
          a.appointment_date AS reference_date,
          a.appointment_time AS reference_time,
          'Status: ' || a.status AS detail
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        JOIN doctors d ON d.id = a.doctor_id

        UNION ALL

        SELECT
          'consultation' AS type,
          c.created_at AS activity_at,
          'Consultation saved' AS title,
          p.full_name AS patient_name,
          d.full_name AS doctor_name,
          c.consultation_date AS reference_date,
          NULL AS reference_time,
          substr(c.doctor_notes, 1, 110) AS detail
        FROM consultations c
        JOIN patients p ON p.id = c.patient_id
        JOIN doctors d ON d.id = c.doctor_id

        UNION ALL

        SELECT
          'billing' AS type,
          b.created_at AS activity_at,
          CASE WHEN b.status = 'paid' THEN 'Payment recorded' ELSE 'Bill generated' END AS title,
          p.full_name AS patient_name,
          NULL AS doctor_name,
          COALESCE(b.payment_date, b.created_at) AS reference_date,
          NULL AS reference_time,
          'Amount: $' || printf('%.2f', b.total_amount) AS detail
        FROM billing b
        JOIN patients p ON p.id = b.patient_id
      )
      ORDER BY activity_at DESC
      LIMIT 8
    `)
    .all();

  res.json({
    summary: {
      totalPatients,
      todaysAppointments,
      pendingBills,
      totalRevenue: toNumber(revenueRow.total, 0),
    },
    upcomingAppointments,
    recentActivity,
  });
});

module.exports = router;
