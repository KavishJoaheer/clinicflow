import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, CreditCard, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { api } from "../lib/api.js";
import { formatCurrency, formatDate, formatDateTime } from "../lib/format.js";

function HighlightStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-white/85 p-5">
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

function PatientProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadPatient() {
      try {
        const response = await api.get(`/patients/${id}`);
        if (!ignore) {
          setData(response);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPatient();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingState label="Loading patient profile" />;
  }

  if (!data) {
    return (
      <EmptyState
        title="Patient unavailable"
        description="The requested record could not be loaded. Return to the patient directory and try again."
        action={
          <Link
            to="/patients"
            className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Back to patients
          </Link>
        }
      />
    );
  }

  const totalBilled = data.bills.reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Patient profile"
        title={data.patient.full_name}
        description={`${data.patient.age} years old - ${data.patient.contact_number} - ${data.patient.address}`}
        actions={
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
          >
            <ArrowLeft className="size-4" />
            Back to patients
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <HighlightStat
          icon={CalendarClock}
          label="Appointments"
          value={data.appointments.length}
        />
        <HighlightStat
          icon={FileText}
          label="Consultations"
          value={data.consultations.length}
        />
        <HighlightStat
          icon={CreditCard}
          label="Total billed"
          value={formatCurrency(totalBilled)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Appointment history"
          subtitle="Timeline of scheduled visits and status changes."
        >
          {data.appointments.length ? (
            <div className="space-y-3">
              {data.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{appointment.doctor_name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {appointment.specialization}
                      </p>
                    </div>
                    <StatusBadge value={appointment.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {formatDateTime(
                      appointment.appointment_date,
                      appointment.appointment_time,
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No appointments yet"
              description="Appointments linked to this patient will appear here once they are scheduled."
            />
          )}
        </SectionCard>

        <SectionCard title="Billing history" subtitle="Every bill attached to this patient's consultations.">
          {data.bills.length ? (
            <div className="space-y-3">
              {data.bills.map((bill) => (
                <div
                  key={bill.id}
                  className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {formatCurrency(bill.total_amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {bill.doctor_name} - {formatDate(bill.consultation_date)}
                      </p>
                    </div>
                    <StatusBadge value={bill.status} />
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    {bill.items.map((item, index) => (
                      <li key={`${bill.id}-${index}`}>
                        {item.description}: {formatCurrency(item.amount)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No billing records"
              description="Bills are created automatically when a consultation is saved."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Consultation notes"
        subtitle="Clinical notes, assessments, and follow-up instructions."
      >
        {data.consultations.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.consultations.map((consultation) => (
              <article
                key={consultation.id}
                className="rounded-[26px] border border-slate-200/80 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{consultation.doctor_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {consultation.specialization} - {formatDate(consultation.consultation_date)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {consultation.doctor_notes}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No consultations recorded"
            description="Consultation notes will appear here as soon as a doctor completes a visit and saves the note."
          />
        )}
      </SectionCard>
    </div>
  );
}

export default PatientProfilePage;
