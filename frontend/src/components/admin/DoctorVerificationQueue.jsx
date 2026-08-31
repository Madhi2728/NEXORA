import { useMemo, useState } from "react";
import { BadgeCheck, Check, X } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useAdminVerifications, adminActions } from "../../hooks/useAdmin";
import { StatePanel, StatusBadge, formatDate, inputCls } from "./shared";

const FILTERS = ["pending", "approved", "rejected"];

function VerificationCard({ v, onReviewed }) {
  const [notes, setNotes] = useState(v.notes || "");
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState("");

  async function review(status) {
    setBusy(status);
    setErr("");
    try {
      await adminActions.reviewVerification(v.id, { status, notes });
      onReviewed();
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not save.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-100">
            {v.user?.name || "Unknown doctor"}
          </p>
          <p className="text-xs text-slate-500">{v.user?.email}</p>
        </div>
        <StatusBadge value={v.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <dt className="text-slate-500">License #</dt>
          <dd className="text-slate-200">{v.license_number || "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Specialization</dt>
          <dd className="text-slate-200">{v.specialization || "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-slate-500">Affiliation</dt>
          <dd className="text-slate-200">{v.hospital_affiliation || "—"}</dd>
        </div>
        {v.reviewed_at && (
          <div className="col-span-2">
            <dt className="text-slate-500">Reviewed</dt>
            <dd className="text-slate-200">
              {formatDate(v.reviewed_at, true)}
              {v.reviewer?.name ? ` · ${v.reviewer.name}` : ""}
            </dd>
          </div>
        )}
      </dl>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Review notes (optional)…"
        className={`${inputCls} mt-3 resize-y`}
      />

      {err && <p className="mt-2 text-xs text-rose-400">{err}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => review("approved")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" />
          {busy === "approved" ? "Approving…" : "Approve"}
        </button>
        <button
          onClick={() => review("rejected")}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-950/50 disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" />
          {busy === "rejected" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </div>
  );
}

export default function DoctorVerificationQueue() {
  const [filter, setFilter] = useState("pending");
  const params = useMemo(() => ({ status: filter }), [filter]);
  const { data, loading, error, refetch } = useAdminVerifications(params);

  const verifications = data?.verifications || [];

  return (
    <SectionCard
      icon={BadgeCheck}
      title="Doctor Verification"
      accent="from-violet-500 to-purple-500"
      iconBg="bg-violet-900/40 text-violet-300"
      fullHeight
      headerExtra={
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-2.5 py-1 text-xs capitalize transition-colors ${
                filter === f
                  ? "bg-violet-900/40 text-violet-200"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      <StatePanel
        loading={loading}
        error={error}
        isEmpty={verifications.length === 0}
        emptyText={`No ${filter} verifications.`}
      >
        <div className="space-y-3">
          {verifications.map((v) => (
            <VerificationCard key={v.id} v={v} onReviewed={refetch} />
          ))}
        </div>
      </StatePanel>
    </SectionCard>
  );
}
