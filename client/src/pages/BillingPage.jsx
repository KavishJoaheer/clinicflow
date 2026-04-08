import { useEffect, useMemo, useState } from "react";
import { CreditCard, DollarSign, Plus, ReceiptText, SquarePen } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { api } from "../lib/api.js";
import { formatCurrency, formatDate } from "../lib/format.js";

function BillingStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BillingModal({ open, bill, onClose, onSubmit, isSaving }) {
  const [status, setStatus] = useState("unpaid");
  const [paymentDate, setPaymentDate] = useState("");
  const [items, setItems] = useState([{ description: "", amount: "0" }]);

  useEffect(() => {
    if (!open || !bill) return;

    setStatus(bill.status);
    setPaymentDate(bill.payment_date || "");
    setItems(
      bill.items.map((item) => ({
        description: item.description,
        amount: String(item.amount),
      })),
    );
  }, [open, bill]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [items]);

  function updateItem(index, key, value) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      items: items.map((item) => ({
        description: item.description,
        amount: Number(item.amount),
      })),
      status,
      payment_date: status === "paid" ? paymentDate : null,
    });
  }

  if (!bill) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit bill #${bill.id}`}
      description="Refine line items, adjust status, and capture payment dates as the bill moves through the collection workflow."
      size="xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-[26px] border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-lg font-semibold text-slate-950">{bill.patient_name}</p>
          <p className="mt-1 text-sm text-slate-600">
            {bill.doctor_name} • {formatDate(bill.consultation_date)}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input
                required
                value={item.description}
                onChange={(event) =>
                  updateItem(index, "description", event.target.value)
                }
                placeholder="Description"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
              />
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={item.amount}
                onChange={(event) => updateItem(index, "amount", event.target.value)}
                placeholder="Amount"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={() =>
                  setItems((current) =>
                    current.length > 1
                      ? current.filter((_, itemIndex) => itemIndex !== index)
                      : current,
                  )
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setItems((current) => [...current, { description: "", amount: "0" }])
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
          >
            <Plus className="size-4" />
            Add line item
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Payment date</span>
            <input
              type="date"
              disabled={status !== "paid"}
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Update bill"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BillingPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [bills, setBills] = useState([]);
  const [patientSummary, setPatientSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      const [billingData, summaryData] = await Promise.all([
        api.get(`/billing${statusFilter ? `?status=${statusFilter}` : ""}`),
        api.get("/billing/patient-summary"),
      ]);

      setBills(billingData);
      setPatientSummary(summaryData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const overallPaid = patientSummary.reduce(
    (sum, patient) => sum + Number(patient.paid_amount || 0),
    0,
  );
  const overallUnpaid = patientSummary.reduce(
    (sum, patient) => sum + Number(patient.unpaid_amount || 0),
    0,
  );
  const overallBilled = patientSummary.reduce(
    (sum, patient) => sum + Number(patient.total_billed || 0),
    0,
  );

  async function handleSave(payload) {
    if (!editor?.bill) return;

    setIsSaving(true);

    try {
      await api.put(`/billing/${editor.bill.id}`, payload);
      toast.success("Bill updated.");
      setEditor(null);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function markAsPaid(billId) {
    try {
      await api.patch(`/billing/${billId}/pay`, {});
      toast.success("Bill marked as paid.");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <LoadingState label="Loading billing" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Revenue"
        title="Billing"
        description="Track every consultation bill, maintain line items, and monitor which patients still have balances outstanding."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <BillingStat icon={DollarSign} label="Total billed" value={formatCurrency(overallBilled)} />
        <BillingStat icon={CreditCard} label="Collected" value={formatCurrency(overallPaid)} />
        <BillingStat
          icon={ReceiptText}
          label="Outstanding"
          value={formatCurrency(overallUnpaid)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Bills"
          subtitle="Review line items and payment status for every consultation."
          actions={
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">All bills</option>
              <option value="unpaid">Unpaid only</option>
              <option value="paid">Paid only</option>
            </select>
          }
        >
          {bills.length ? (
            <div className="overflow-hidden rounded-[24px] border border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Patient</th>
                      <th className="px-5 py-4">Consultation</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-t border-slate-200/70">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">{bill.patient_name}</p>
                          <p className="mt-1 text-sm text-slate-500">{bill.doctor_name}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          <p>{formatDate(bill.consultation_date)}</p>
                          <p className="mt-1 text-slate-500">{bill.items.length} line items</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-950">
                          {formatCurrency(bill.total_amount)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge value={bill.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditor({ bill })}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
                            >
                              <SquarePen className="size-4" />
                              Edit
                            </button>
                            {bill.status === "unpaid" ? (
                              <button
                                type="button"
                                onClick={() => markAsPaid(bill.id)}
                                className="rounded-2xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                              >
                                Mark paid
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No bills found"
              description="Bills are created from consultations. Adjust the filter or save a consultation to generate a bill."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Per-patient summary"
          subtitle="Balances and collections grouped by patient."
        >
          {patientSummary.length ? (
            <div className="space-y-3">
              {patientSummary.map((patient) => (
                <div
                  key={patient.patient_id}
                  className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{patient.patient_name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {patient.bill_count} bills total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-950">
                        {formatCurrency(patient.total_billed)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Paid {formatCurrency(patient.paid_amount)} • Due{" "}
                        {formatCurrency(patient.unpaid_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No billing summary available"
              description="Patient billing totals will appear here once consultations generate bills."
            />
          )}
        </SectionCard>
      </div>

      <BillingModal
        open={Boolean(editor)}
        bill={editor?.bill}
        onClose={() => setEditor(null)}
        onSubmit={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}

export default BillingPage;
