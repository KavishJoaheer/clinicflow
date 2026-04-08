import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, SquarePen, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { api } from "../lib/api.js";
import { formatDate } from "../lib/format.js";

const emptyPatient = {
  full_name: "",
  age: "",
  contact_number: "",
  address: "",
};

function PatientFormModal({ open, patient, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(emptyPatient);

  useEffect(() => {
    if (!open) return;

    setForm(
      patient
        ? {
            full_name: patient.full_name,
            age: String(patient.age),
            contact_number: patient.contact_number,
            address: patient.address,
          }
        : emptyPatient,
    );
  }, [open, patient]);

  const actionLabel = patient ? "Update patient" : "Add patient";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      age: Number(form.age),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={patient ? "Edit patient" : "Add patient"}
      description="Maintain clear, complete patient records for scheduling, clinical notes, and billing."
      size="lg"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input
              required
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Age</span>
            <input
              required
              min="0"
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Contact number</span>
            <input
              required
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Address</span>
            <textarea
              required
              rows="4"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white md:min-h-full"
            />
          </label>
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
            className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : actionLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PatientsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [patientsData, setPatientsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  async function loadPatients() {
    const target = patientsData ? setRefreshing : setLoading;
    target(true);

    try {
      const data = await api.get(
        `/patients?search=${encodeURIComponent(deferredSearch)}&page=${page}&limit=8`,
      );
      setPatientsData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, [deferredSearch, page]);

  const patients = patientsData?.items || [];
  const pagination = patientsData?.pagination;

  const headerActions = useMemo(
    () => (
      <button
        type="button"
        onClick={() => setEditor({ mode: "create", patient: null })}
        className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
      >
        <Plus className="size-4" />
        Add patient
      </button>
    ),
    [],
  );

  async function handleSave(payload) {
    setIsSaving(true);

    try {
      if (editor?.mode === "edit") {
        await api.put(`/patients/${editor.patient.id}`, payload);
        toast.success("Patient record updated.");
      } else {
        await api.post("/patients", payload);
        toast.success("Patient added successfully.");
        setPage(1);
      }

      setEditor(null);
      await loadPatients();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!patientToDelete) return;

    try {
      await api.delete(`/patients/${patientToDelete.id}`);
      toast.success("Patient deleted.");
      setPatientToDelete(null);
      await loadPatients();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <LoadingState label="Loading patients" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry"
        title="Patients"
        description="Search, review, and maintain patient demographics, then jump into each patient’s appointment, consultation, and billing history."
        actions={headerActions}
      />

      <SectionCard
        title="Patient directory"
        subtitle={`${pagination?.total || 0} total records`}
        actions={
          refreshing ? (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Refreshing...
            </span>
          ) : null
        }
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, number, or address"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-600">
            Detailed profiles open on their own page for timeline review.
          </div>
        </div>

        {patients.length ? (
          <>
            <div className="overflow-hidden rounded-[24px] border border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Patient</th>
                      <th className="px-5 py-4">Contact</th>
                      <th className="px-5 py-4">Activity</th>
                      <th className="px-5 py-4">Created</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-t border-slate-200/70">
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                              <UserRound className="size-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{patient.full_name}</p>
                              <p className="mt-1 text-sm text-slate-500">{patient.age} years old</p>
                              <p className="mt-1 text-sm text-slate-500">{patient.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-slate-800">{patient.contact_number}</p>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-slate-600">
                          <p>{patient.appointment_count} appointments</p>
                          <p className="mt-1">{patient.consultation_count} consultations</p>
                          <p className="mt-1">{patient.bill_count} bills</p>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-slate-500">
                          {formatDate(patient.created_at)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              to={`/patients/${patient.id}`}
                              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEditor({ mode: "edit", patient })}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
                            >
                              <SquarePen className="size-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPatientToDelete(patient)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(pagination.totalPages, current + 1))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No patients found"
            description="Try a broader search or add a new patient to start tracking appointments, consultations, and billing."
            action={headerActions}
          />
        )}
      </SectionCard>

      <PatientFormModal
        open={Boolean(editor)}
        patient={editor?.patient}
        onClose={() => setEditor(null)}
        onSubmit={handleSave}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={Boolean(patientToDelete)}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDelete}
        title="Delete patient?"
        description={
          patientToDelete
            ? `This will permanently remove ${patientToDelete.full_name} if no linked records exist.`
            : ""
        }
        confirmLabel="Delete patient"
      />
    </div>
  );
}

export default PatientsPage;
