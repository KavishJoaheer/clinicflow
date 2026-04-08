const express = require("express");
const { db } = require("../db");
const {
  calculateBillingTotal,
  getTodayLocal,
  normalizeBillingItems,
  parseBillingRow,
} = require("../lib/utils");

const router = express.Router();

router.get("/patient-summary", (_req, res) => {
  const summary = db
    .prepare(`
      SELECT
        p.id AS patient_id,
        p.full_name AS patient_name,
        COUNT(b.id) AS bill_count,
        COALESCE(SUM(b.total_amount), 0) AS total_billed,
        COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.total_amount ELSE 0 END), 0) AS paid_amount,
        COALESCE(SUM(CASE WHEN b.status = 'unpaid' THEN b.total_amount ELSE 0 END), 0) AS unpaid_amount
      FROM patients p
      LEFT JOIN billing b ON b.patient_id = p.id
      GROUP BY p.id
      ORDER BY unpaid_amount DESC, total_billed DESC, patient_name ASC
    `)
    .all();

  res.json(summary);
});

router.get("/", (req, res) => {
  const status = String(req.query.status ?? "").trim();
  const patientId = String(req.query.patientId ?? "").trim();

  const bills = db
    .prepare(`
      SELECT
        b.*,
        p.full_name AS patient_name,
        c.consultation_date,
        d.full_name AS doctor_name
      FROM billing b
      JOIN patients p ON p.id = b.patient_id
      JOIN consultations c ON c.id = b.consultation_id
      JOIN doctors d ON d.id = c.doctor_id
      WHERE (@status = '' OR b.status = @status)
        AND (@patientId = '' OR CAST(b.patient_id AS TEXT) = @patientId)
      ORDER BY b.created_at DESC
    `)
    .all({ status, patientId })
    .map(parseBillingRow);

  res.json(bills);
});

router.get("/:id", (req, res) => {
  const billId = Number(req.params.id);
  const bill = db
    .prepare(`
      SELECT
        b.*,
        p.full_name AS patient_name,
        c.consultation_date,
        d.full_name AS doctor_name
      FROM billing b
      JOIN patients p ON p.id = b.patient_id
      JOIN consultations c ON c.id = b.consultation_id
      JOIN doctors d ON d.id = c.doctor_id
      WHERE b.id = ?
    `)
    .get(billId);

  if (!bill) return res.status(404).json({ error: "Bill not found." });
  res.json(parseBillingRow(bill));
});

router.put("/:id", (req, res) => {
  const billId = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM billing WHERE id = ?").get(billId);

  if (!existing) return res.status(404).json({ error: "Bill not found." });

  const items = normalizeBillingItems(req.body.items);
  if (!items.length) {
    return res.status(400).json({ error: "At least one billing line item is required." });
  }

  const status = String(req.body.status ?? existing.status).trim();
  if (!["paid", "unpaid"].includes(status)) {
    return res.status(400).json({ error: "Billing status is invalid." });
  }

  const paymentDate =
    status === "paid"
      ? String(req.body.payment_date ?? existing.payment_date ?? getTodayLocal()).trim()
      : null;

  db.prepare(`
    UPDATE billing
    SET items = ?, total_amount = ?, status = ?, payment_date = ?
    WHERE id = ?
  `).run(
    JSON.stringify(items),
    calculateBillingTotal(items),
    status,
    paymentDate || null,
    billId,
  );

  const updated = db.prepare("SELECT * FROM billing WHERE id = ?").get(billId);
  res.json(parseBillingRow(updated));
});

router.patch("/:id/pay", (req, res) => {
  const billId = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM billing WHERE id = ?").get(billId);

  if (!existing) return res.status(404).json({ error: "Bill not found." });

  db.prepare(`
    UPDATE billing
    SET status = 'paid', payment_date = ?
    WHERE id = ?
  `).run(getTodayLocal(), billId);

  const updated = db.prepare("SELECT * FROM billing WHERE id = ?").get(billId);
  res.json(parseBillingRow(updated));
});

module.exports = router;
