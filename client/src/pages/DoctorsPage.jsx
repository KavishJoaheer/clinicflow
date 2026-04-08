import { useEffect, useState } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { api } from "../lib/api.js";

const emptyDoctor = {
  full_name: "",
  specialization: "",
};

function DoctorFormModal({ open, doctor, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(emptyDoctor);

  useEffect(() => {
    if (!open) return;
    setForm(
      doctor
        ? { full_name: doctor.full_name, specialization: doctor.specialization }
        : emptyDoctor,
    );
  }, [open, doctor]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doctor ? "Edit doctor" : "Add doctor"}
      description="Maintain a clean list of clinicians and their specialties for scheduling and consultation workflows."
      size="md"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <input
            required
            value={form.full_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, full_name: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Specialization</span>
          <input
            required
            value={form.specialization}
            onChange={(event) =>
              setForm((current) => ({ ...current, specialization: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>

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
            {isSaving ? "Saving..." : doctor ? "Update doctor" : "Add doctor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadDoctors() {
    try {
      const data = await api.get("/doctors");
      setDoctors(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  async function handleSave(payload) {
    setIsSaving(true);

    try {
      if (editor?.doctor) {
        await api.put(`/doctors/${editor.doctor.id}`, payload);
        toast.success("Doctor updated.");
      } else {
        await api.post("/doctors", payload);
        toast.success("Doctor added.");
      }

      setEditor(null);
      await loadDoctors();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!doctorToDelete) return;

    try {
      await api.delete(`/doctors/${doctorToDelete.id}`);
      toast.success("Doctor removed.");
      setDoctorToDelete(null);
      await loadDoctors();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <LoadingState label="Loading doctors" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roster"
        title="Doctors"
        description="Keep your active clinicians and specializations organized so appointments and consultations can be linked accurately."
        actions={
          <button
            type="button"
            onClick={() => setEditor({ doctor: null })}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <Plus className="size-4" />
            Add doctor
          </button>
        }
      />

      <SectionCard title="Doctor list" subtitle="Manage care providers for the clinic.">
        {doctors.length ? (
          <div className="overflow-hidden rounded-[24px] border border-slate-200/80">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Specialization</th>
                    <th className="px-5 py-4">Linked work</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-t border-slate-200/70">
                      <td className="px-5 py-4 font-semibold text-slate-950">{doctor.full_name}</td>
                      <td className="px-5 py-4 text-slate-600">{doctor.specialization}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {doctor.appointment_count} appointments • {doctor.consultation_count} consultations
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditor({ doctor })}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
                          >
                            <SquarePen className="size-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDoctorToDelete(doctor)}
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
        ) : (
          <EmptyState
            title="No doctors available"
            description="Add doctors to begin scheduling appointments and linking consultations."
          />
        )}
      </SectionCard>

      <DoctorFormModal
        open={Boolean(editor)}
        doctor={editor?.doctor}
        onClose={() => setEditor(null)}
        onSubmit={handleSave}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={Boolean(doctorToDelete)}
        onClose={() => setDoctorToDelete(null)}
        onConfirm={handleDelete}
        title="Delete doctor?"
        description={
          doctorToDelete
            ? `This will remove ${doctorToDelete.full_name} only if they have no linked appointments or consultations.`
            : ""
        }
        confirmLabel="Delete doctor"
      />
    </div>
  );
}

export default DoctorsPage;
