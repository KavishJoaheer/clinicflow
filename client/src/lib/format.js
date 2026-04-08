import dayjs from "dayjs";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "Not set";
  return dayjs(value).format("MMM D, YYYY");
}

export function formatDateTime(date, time) {
  if (!date) return "Not scheduled";
  if (!time) return dayjs(date).format("MMM D, YYYY");
  return dayjs(`${date}T${time}`).format("MMM D, YYYY • h:mm A");
}

export function truncate(value, limit = 110) {
  if (!value) return "";
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

export function statusLabel(value) {
  return String(value || "").replace(/_/g, " ");
}

export function statusTone(status) {
  switch (status) {
    case "completed":
    case "paid":
      return "bg-emerald-100 text-emerald-700 ring-emerald-600/20";
    case "cancelled":
      return "bg-rose-100 text-rose-700 ring-rose-600/20";
    case "scheduled":
    case "unpaid":
      return "bg-sky-100 text-sky-700 ring-sky-600/20";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-500/20";
  }
}
