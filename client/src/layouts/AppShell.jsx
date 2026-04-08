import dayjs from "dayjs";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const pageMeta = {
  "/": {
    label: "Dashboard",
    helper: "Live operational view of patients, appointments, billing, and activity.",
  },
  "/patients": {
    label: "Patients",
    helper: "Manage patient records and review their care timeline at a glance.",
  },
  "/appointments": {
    label: "Appointments",
    helper: "Coordinate clinic schedules in calendar and list form without losing context.",
  },
  "/consultations": {
    label: "Consultations",
    helper: "Capture clinical notes and keep billing linked automatically.",
  },
  "/billing": {
    label: "Billing",
    helper: "Track invoices, payment status, and each patient's financial summary.",
  },
  "/doctors": {
    label: "Doctors",
    helper: "Maintain the clinic roster and specializations.",
  },
};

function AppShell() {
  const location = useLocation();
  const isPatientProfile = location.pathname.startsWith("/patients/");
  const activeMeta = isPatientProfile
    ? {
        label: "Patient profile",
        helper: "A complete record of visits, notes, and billing for one patient.",
      }
    : pageMeta[location.pathname] || pageMeta["/"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#edf5ff_100%)] text-slate-900">
      <div className="mx-auto min-h-screen max-w-[1600px] lg:flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="border-b border-white/70 bg-white/55 px-5 py-5 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                  {activeMeta.label}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {activeMeta.helper}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/80 bg-white/90 px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Today
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {dayjs().format("dddd, MMMM D")}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
