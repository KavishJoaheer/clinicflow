import dayjs from "dayjs";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const pageMeta = {
  "/": {
    label: "Dashboard",
    helper: "Live operational view of patients, appointments, billing, and dispatch activity.",
  },
  "/patients": {
    label: "Patients",
    helper: "Manage patient records and review each OCS Medecins care timeline at a glance.",
  },
  "/appointments": {
    label: "Appointments",
    helper: "Coordinate home visit schedules in calendar and list form without losing context.",
  },
  "/consultations": {
    label: "Consultations",
    helper: "Capture doctor notes and keep billing linked automatically.",
  },
  "/billing": {
    label: "Billing",
    helper: "Track invoices, payment status, and each patient's billing summary.",
  },
  "/doctors": {
    label: "Doctors",
    helper: "Maintain the OCS Medecins roster and specializations.",
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(65,200,198,0.24),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(242,193,77,0.12),_transparent_20%),linear-gradient(180deg,_#f9fdfd_0%,_#eef8f8_100%)] text-slate-900">
      <div className="mx-auto min-h-screen max-w-[1600px] lg:flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="border-b border-white/70 bg-white/65 px-5 py-5 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2d8f98]">
                  OCS Medecins Operations
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                  {activeMeta.label}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {activeMeta.helper}
                </p>
              </div>

              <div className="rounded-[30px] border border-[rgba(65,200,198,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,251,250,0.9))] px-5 py-4 shadow-[0_16px_40px_rgba(34,72,91,0.1)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#5c8590]">
                  Mauritius Dispatch Desk
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {dayjs().format("dddd, MMMM D")}
                </p>
                <p className="mt-1 text-sm text-[#2d8f98]">Home visit coordination ready</p>
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
