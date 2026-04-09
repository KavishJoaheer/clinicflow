import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  CreditCard,
  DollarSign,
  MapPinned,
  PhoneCall,
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { api } from "../lib/api.js";
import { formatCurrency, formatDateTime, truncate } from "../lib/format.js";

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-[28px] border border-[rgba(65,200,198,0.14)] bg-white/88 p-5 shadow-[0_24px_64px_rgba(34,72,91,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`rounded-3xl p-4 ${accent}`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const data = await api.get("/dashboard");
        if (!ignore) {
          setDashboard(data);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OCS Medecins"
        title="Operations dashboard"
        description="A daily command center for your home visit team, with patient activity, appointments, billing, and care updates organized in one branded workspace."
      />

      <section className="ocs-pattern relative overflow-hidden rounded-[36px] border border-[rgba(255,255,255,0.28)] bg-[linear-gradient(135deg,#2d8f98_0%,#41c8c6_60%,#71ddd3_100%)] px-6 py-7 text-white shadow-[0_38px_95px_rgba(34,72,91,0.18)] lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/72">
              Home Visit Doctors
            </p>
            <h3 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-tight">
              Calm coordination for OCS Medecins.
              <span className="block text-[#ffe189]">From hotline to billing.</span>
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/84">
              Track patient requests, assign doctors, complete consultation notes, and follow payment status without switching systems.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[26px] border border-white/18 bg-white/14 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3 text-[#ffe189]">
                  <PhoneCall className="size-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">Hotline</p>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">52 52 22 34</p>
                <p className="mt-1 text-sm text-white/76">Quick dispatch and scheduling support</p>
              </div>
              <div className="rounded-[26px] border border-white/18 bg-[#2b8a93]/48 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3 text-[#ffe189]">
                  <MapPinned className="size-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">Coverage</p>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight">All over Mauritius</p>
                <p className="mt-1 text-sm text-white/76">Built for 24/7 home visit coordination</p>
              </div>
            </div>
          </div>

          <div className="ocs-glass rounded-[30px] border border-white/45 p-5 text-[#22485b]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2d8f98]">
              Today's readiness
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-[22px] bg-white/75 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Scheduled visits</p>
                  <p className="text-sm text-[#678891]">Patients currently on the calendar</p>
                </div>
                <p className="text-2xl font-bold text-[#2d8f98]">
                  {dashboard.summary.todaysAppointments}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-white/75 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Pending billing</p>
                  <p className="text-sm text-[#678891]">
                    Consultations waiting on payment follow-up
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#d7a32d]">
                  {dashboard.summary.pendingBills}
                </p>
              </div>
              <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(65,200,198,0.12),rgba(242,193,77,0.16))] px-4 py-4">
                <p className="text-sm font-semibold">Revenue snapshot</p>
                <p className="mt-2 text-3xl font-bold text-[#22485b]">
                  {formatCurrency(dashboard.summary.totalRevenue)}
                </p>
                <p className="mt-1 text-sm text-[#678891]">
                  Collected across completed consultations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Activity}
          label="Total patients"
          value={dashboard.summary.totalPatients}
          accent="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <SummaryCard
          icon={CalendarClock}
          label="Today's appointments"
          value={dashboard.summary.todaysAppointments}
          accent="bg-gradient-to-br from-cyan-500 to-sky-600"
        />
        <SummaryCard
          icon={CreditCard}
          label="Pending bills"
          value={dashboard.summary.pendingBills}
          accent="bg-gradient-to-br from-amber-400 to-orange-500"
        />
        <SummaryCard
          icon={DollarSign}
          label="Total revenue"
          value={formatCurrency(dashboard.summary.totalRevenue)}
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Upcoming appointments"
          subtitle="The next seven days of scheduled home visits."
        >
          {dashboard.upcomingAppointments.length ? (
            <div className="space-y-4">
              {dashboard.upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-[26px] border border-slate-200/80 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {appointment.patient_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      with {appointment.doctor_name} - {appointment.specialization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium text-slate-700">
                      {formatDateTime(
                        appointment.appointment_date,
                        appointment.appointment_time,
                      )}
                    </p>
                    <StatusBadge value={appointment.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No appointments in the next week"
              description="Once appointments are created, they will appear here with patient and doctor details."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Recent activity"
          subtitle="A quick feed of scheduling, consultation, and billing events."
        >
          {dashboard.recentActivity.length ? (
            <div className="space-y-4">
              {dashboard.recentActivity.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-sky-500" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-950">{activity.title}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {activity.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {activity.patient_name}
                      {activity.doctor_name ? ` - ${activity.doctor_name}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {truncate(activity.detail, 96)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent updates"
              description="Activity will appear here as appointments, consultations, and payments are recorded."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default DashboardPage;
