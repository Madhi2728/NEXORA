// Shared building blocks for the admin panels — keeps loading / error / empty
// handling identical across every section (a hard requirement) without each
// panel re-implementing it.

import { Loader2, Inbox, AlertTriangle } from "lucide-react";

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  if (withTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return d.toLocaleString("en-IN", opts);
}

export function relativeDay(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const days = Math.round((startOf(today) - startOf(d)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;
  return formatDate(value);
}

// Wrap a panel's body. Renders a spinner while loading, an error box on
// failure, an empty state when there's nothing, otherwise the children.
export function StatePanel({
  loading,
  error,
  isEmpty,
  emptyText = "Nothing here yet.",
  children,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 py-10 px-4 text-center">
        <AlertTriangle className="h-5 w-5 text-rose-300" />
        <p className="text-sm text-rose-200">{error}</p>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-slate-500">
        <Inbox className="h-6 w-6" />
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }
  return children;
}

const STATUS_TONE = {
  active: "bg-emerald-900/40 text-emerald-300",
  approved: "bg-emerald-900/40 text-emerald-300",
  confirmed: "bg-emerald-900/40 text-emerald-300",
  done: "bg-emerald-900/40 text-emerald-300",
  completed: "bg-emerald-900/40 text-emerald-300",
  pending: "bg-amber-900/40 text-amber-300",
  processing: "bg-amber-900/40 text-amber-300",
  "in-progress": "bg-amber-900/40 text-amber-300",
  waiting: "bg-slate-700/60 text-slate-300",
  suspended: "bg-rose-900/40 text-rose-300",
  rejected: "bg-rose-900/40 text-rose-300",
  cancelled: "bg-rose-900/40 text-rose-300",
  failed: "bg-rose-900/40 text-rose-300",
};

export function StatusBadge({ value }) {
  const key = String(value || "").toLowerCase();
  const tone = STATUS_TONE[key] || "bg-slate-700/60 text-slate-300";
  return (
    <span
      className={`text-eyebrow inline-block rounded-full px-2 py-0.5 ${tone}`}
    >
      {String(value || "—").replace(/[-_]/g, " ")}
    </span>
  );
}

export function SourceBadge({ source }) {
  const written = source === "written";
  return (
    <span
      className={`text-eyebrow inline-block rounded-full px-2 py-0.5 ${
        written
          ? "bg-violet-900/40 text-violet-300"
          : "bg-sky-900/40 text-sky-300"
      }`}
    >
      {written ? "written" : "ocr"}
    </span>
  );
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  if (pages <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of{" "}
        {total}
      </span>
      <div className="flex gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-slate-700 px-2 py-1 transition-colors hover:border-slate-500 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-slate-700 px-2 py-1 transition-colors hover:border-slate-500 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 [color-scheme:dark]";
