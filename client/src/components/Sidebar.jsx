import {
  CalendarDays,
  ClipboardPenLine,
  CreditCard,
  LayoutDashboard,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cx } from "../lib/utils.js";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/patients", label: "Patients", icon: UsersRound },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/consultations", label: "Consultations", icon: ClipboardPenLine },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
];

function SidebarLink({ item, mobile = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      end={item.end}
      to={item.to}
      className={({ isActive }) =>
        cx(
          "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
          mobile
            ? "min-w-fit border border-white/40 bg-white/70 text-slate-600 hover:bg-white"
            : "text-slate-200/80 hover:bg-white/10 hover:text-white",
          isActive &&
            (mobile
              ? "border-sky-400/30 bg-sky-600 text-white shadow-lg shadow-sky-600/20"
              : "bg-white/14 text-white shadow-lg shadow-sky-950/20"),
        )
      }
    >
      <Icon className={cx("size-4", mobile ? "text-current" : "text-sky-200")} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Sidebar() {
  return (
    <>
      <div className="border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur lg:hidden">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              ClinicFlow
            </p>
            <h1 className="font-display text-2xl text-slate-900">Care coordination</h1>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Live system
            </p>
            <p className="text-sm font-semibold text-slate-900">Small clinic mode</p>
          </div>
        </div>

        <nav className="flex gap-3 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} mobile />
          ))}
        </nav>
      </div>

      <aside className="hidden w-80 shrink-0 border-r border-white/40 bg-slate-950/90 text-white lg:flex lg:flex-col">
        <div className="flex flex-1 flex-col px-6 py-8">
          <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-slate-950 p-6 shadow-2xl shadow-slate-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200">
              ClinicFlow
            </p>
            <h1 className="mt-3 font-display text-4xl leading-none text-white">
              Patient care,
              <span className="mt-2 block text-sky-200">finally organized.</span>
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              One calm workspace for appointments, consultation notes, and billing.
            </p>
          </div>

          <div className="mt-8">
            <p className="px-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Navigation
            </p>
            <nav className="mt-4 space-y-2">
              {navItems.map((item) => (
                <SidebarLink key={item.to} item={item} />
              ))}
            </nav>
          </div>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Ready to work
            </p>
            <p className="mt-3 text-lg font-semibold text-white">No auth friction.</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This environment is optimized for quick walk-in workflows and front-desk updates.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
