import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  CreditCard,
  DollarSign,
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
    <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
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
        eyebrow="Operations"
        title="Clinic dashboard"
        description="A daily operations view for your front desk and care team, with today’s workload, upcoming appointments, revenue, and recent updates in one calm workspace."
      />

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
          subtitle="The next seven days of scheduled patient visits."
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
                      with {appointment.doctor_name} • {appointment.specialization}
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
              description="Once appointments are created, they’ll appear here with patient and doctor details."
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
                      {activity.doctor_name ? ` • ${activity.doctor_name}` : ""}
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
