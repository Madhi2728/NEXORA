// frontend/src/components/doctor/PatientRecordsPanel.jsx
//
// Slide-over panel showing one patient's full clinical record: demographics,
// allergies / chronic conditions, visit history, prescription history and lab
// results. Opens over the current view (no route change).
//
// Self-contained — depends only on its props and the patientRecordsService, so
// it can be reused from admin views later.
//
//   <PatientRecordsPanel
//     patientId="uuid"                 // required to fetch a real record
//     patientName="Ananya Raghavan"    // header fallback while loading
//     fallback={{ age: 34, sex: "F" }} // shown when patientId is absent (demo row)
//     onClose={() => ...}
//   />

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FolderOpen,
  User as UserIcon,
  Stethoscope,
  Pill,
  FlaskConical,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getPatientRecords } from "../../services/patientRecordsService";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const LAB_STATUS_STYLES = {
  normal: "text-emerald-300",
  high: "text-rose-300",
  low: "text-amber-300",
  critical: "text-rose-300 font-semibold",
};

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-200">{value || "—"}</p>
    </div>
  );
}

function ChipList({ items, tone }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">None on record</p>;
  }
  const toneCls =
    tone === "rose"
      ? "border-rose-500/40 bg-rose-950/30 text-rose-200"
      : "border-amber-500/40 bg-amber-950/20 text-amber-200";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full border px-2.5 py-1 text-xs ${toneCls}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PatientRecordsPanel({
  patientId,
  patientName,
  fallback,
  onClose,
}) {
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState("");
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!patientId) return;
    let active = true;
    setLoading(true);
    setError("");
    getPatientRecords(patientId)
      .then((data) => active && setRecord(data))
      .catch(
        (err) =>
          active &&
          setError(
            err?.response?.data?.message ||
              "Could not load this patient's record.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [patientId]);

  const headerName = record?.patient?.name || patientName || "Patient";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/60"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex h-full w-full max-w-md flex-col overflow-hidden border-l border-slate-700 bg-slate-900 shadow-xl transition-transform duration-300 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-1.5 w-full flex-shrink-0 bg-gradient-to-r from-violet-500 to-teal-500" />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-900/40 text-violet-300">
              <FolderOpen size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100">Patient Record</h2>
              <p className="text-xs text-slate-400">{headerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-6">
          {!patientId && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/40 p-4 text-sm text-slate-400">
              This is a demo queue row with no linked patient account. Seed the
              demo data (
              <code className="text-slate-300">npm run seed:doctor</code>) and
              log in as the demo doctor to see a full record here.
              {fallback && (
                <p className="mt-2 text-slate-500">
                  Queue info: {fallback.age ? `${fallback.age} ` : ""}
                  {fallback.sex || ""}
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {record && !loading && (
            <>
              <Section icon={UserIcon} title="Demographics">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name" value={record.patient.name} />
                  <Field
                    label="Age / Sex"
                    value={[
                      record.patient.age != null
                        ? `${record.patient.age}y`
                        : null,
                      record.patient.sex,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                  <Field label="Phone" value={record.patient.phone} />
                  <Field
                    label="Blood group"
                    value={record.patient.bloodGroup}
                  />
                  <Field label="Email" value={record.patient.email} />
                  <Field
                    label="Patient since"
                    value={formatDate(record.patient.memberSince)}
                  />
                </div>
              </Section>

              <Section
                icon={AlertTriangle}
                title="Allergies & chronic conditions"
              >
                <div className="space-y-3">
                  <div>
                    <p className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                      Known allergies
                    </p>
                    <ChipList items={record.allergies} tone="rose" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                      Chronic conditions
                    </p>
                    <ChipList items={record.chronicConditions} tone="amber" />
                  </div>
                </div>
              </Section>

              <Section icon={Stethoscope} title="Visit history">
                {record.visitHistory.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No past visits on record.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {record.visitHistory.map((v) => (
                      <div
                        key={v.id}
                        className="border-b border-slate-800 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-slate-200">
                            {v.chiefComplaint || "Visit"}
                          </p>
                          <span className="flex-shrink-0 text-xs capitalize text-slate-500">
                            {v.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDate(v.date)}
                          {v.doctorName ? ` · ${v.doctorName}` : ""}
                          {v.hospitalName ? ` · ${v.hospitalName}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section icon={Pill} title="Prescription history">
                {record.prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No prescriptions on record.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {record.prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400">
                            {formatDate(rx.prescribedDate)}
                            {rx.doctorName ? ` · ${rx.doctorName}` : ""}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                              rx.source === "written"
                                ? "bg-violet-900/40 text-violet-300"
                                : "bg-slate-700/60 text-slate-300"
                            }`}
                          >
                            {rx.source === "written" ? "Written" : "Scanned"}
                          </span>
                        </div>
                        {rx.medications.length > 0 ? (
                          <ul className="space-y-1">
                            {rx.medications.map((m, i) => (
                              <li key={i} className="text-sm text-slate-200">
                                {m.name}
                                <span className="text-slate-500">
                                  {[m.dosage, m.frequency, m.duration]
                                    .filter(Boolean)
                                    .map((x) => ` · ${x}`)
                                    .join("")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No medicines parsed.
                          </p>
                        )}
                        {rx.notes && (
                          <p className="mt-2 text-xs text-slate-400">
                            {rx.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section icon={FlaskConical} title="Lab results">
                {record.labResults.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No lab results on file yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {record.labResults.map((lab, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between gap-2 border-b border-slate-800 py-1.5 last:border-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">
                            {lab.test}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Ref: {lab.normalRange || "—"} ·{" "}
                            {formatDate(lab.reportDate)}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 text-sm ${
                            LAB_STATUS_STYLES[lab.status] || "text-slate-200"
                          }`}
                        >
                          {lab.value}
                          {lab.unit ? ` ${lab.unit}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
