import {
  CalendarDays,
  ClipboardPenLine,
  CreditCard,
  LayoutDashboard,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
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
            ? "min-w-fit border border-[rgba(65,200,198,0.16)] bg-white/80 text-slate-600 hover:bg-white"
            : "text-[#4e7b83] hover:bg-white/70 hover:text-[#22485b]",
          isActive &&
            (mobile
              ? "border-[rgba(65,200,198,0.35)] bg-[#2d8f98] text-white shadow-lg shadow-[rgba(45,143,152,0.18)]"
              : "bg-[linear-gradient(135deg,#41c8c6,#2d8f98)] text-white shadow-lg shadow-[rgba(45,143,152,0.22)]"),
        )
      }
    >
      <Icon className={cx("size-4", mobile ? "text-current" : "text-[#66d7d0]")} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Sidebar() {
  return (
    <>
      <div className="border-b border-[rgba(65,200,198,0.14)] bg-white/88 px-4 py-4 backdrop-blur lg:hidden">
        <div className="mb-4 flex items-center justify-between gap-4">
          <BrandMark size={54} />
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Operations
            </p>
            <p className="text-sm font-semibold text-slate-900">Mauritius dispatch</p>
          </div>
        </div>

        <nav className="flex gap-3 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} mobile />
          ))}
        </nav>
      </div>

      <aside className="hidden w-80 shrink-0 border-r border-[rgba(65,200,198,0.14)] bg-[linear-gradient(180deg,#fbfefe_0%,#eef9f8_100%)] text-white lg:flex lg:flex-col">
        <div className="flex flex-1 flex-col px-6 py-8">
          <div className="ocs-pattern overflow-hidden rounded-[34px] border border-[rgba(255,255,255,0.24)] bg-[linear-gradient(135deg,#2d8f98_0%,#41c8c6_62%,#6edfd3_100%)] p-6 shadow-[0_32px_80px_rgba(34,72,91,0.18)]">
            <BrandMark
              className="text-white"
              logoClassName="drop-shadow-[0_8px_24px_rgba(34,72,91,0.16)]"
              subtitle="Home Visit Doctors"
              size={62}
              titleClassName="text-white"
              subtitleClassName="text-white/74"
            />
            <h1 className="mt-5 font-display text-[2.2rem] leading-[1.05] text-white">
              Home visit care,
              <span className="mt-2 block text-[#ffe189]">beautifully coordinated.</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/86">
              The OCS Medecins operations desk for patients, visits, doctor notes, and billing.
            </p>
          </div>

          <div className="mt-8">
            <p className="px-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#6e949b]">
              Navigation
            </p>
            <nav className="mt-4 space-y-2">
              {navItems.map((item) => (
                <SidebarLink key={item.to} item={item} />
              ))}
            </nav>
          </div>

          <div className="mt-auto rounded-[30px] border border-[rgba(65,200,198,0.16)] bg-white/92 p-5 text-[#22485b] shadow-[0_18px_52px_rgba(34,72,91,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6e949b]">
              Service coverage
            </p>
            <p className="mt-3 text-lg font-semibold text-[#22485b]">24/7 home visit workflow.</p>
            <p className="mt-2 text-sm leading-6 text-[#5b7f8a]">
              Keep hotline requests, doctor assignments, consultation notes, and payment follow-up in one calm workspace.
            </p>
            <div className="mt-4 rounded-[24px] bg-[linear-gradient(90deg,rgba(65,200,198,0.14),rgba(242,193,77,0.14))] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d8f98]">
                Hotline
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-[#22485b]">52 52 22 34</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
