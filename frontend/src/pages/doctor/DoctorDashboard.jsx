import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import SectionCard from "../../components/common/SectionCard";
import NotificationBell from "../../components/common/NotificationBell";
import MessageInboxBell from "../../components/common/MessageInboxBell";
import PrescriptionNotebook from "../../components/doctor/PrescriptionNotebook";
import PatientRecordsPanel from "../../components/doctor/PatientRecordsPanel";
import MessageComposer from "../../components/common/MessageComposer";
import { getDoctorQueue } from "../../services/appointmentService";
import { createWrittenPrescription } from "../../services/prescriptionService";
import {
  getPendingReports,
  getFlaggedReports,
} from "../../services/medicalReportService";
import { ThemeProvider } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";
import {
  CalendarClock,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
  Users,
  FileText,
  Stethoscope,
  TrendingUp,
  ChevronRight,
  Clock,
  Pill,
  FolderOpen,
  ShieldCheck,
  NotebookPen,
  X,
} from "lucide-react";

/**
 * DoctorDashboard – Nexora
 * ------------------------------------------------------------
 * Mirrors PatientDashboard.jsx's visual system (bg-slate-950 base,
 * blurred accent orbs, SectionCard grid, shared header bar) but is
 * built around triage: what needs the doctor's attention right now.
 *
 * Sections:
 *   1. Stats strip        – today's appointments, pending reports,
 *                            critical alerts, unread messages
 *   2. Patient Queue       – today's schedule, time-ordered
 *   3. Critical Alerts     – flagged abnormal lab values, by severity
 *   4. Recent Activity     – new reports/prescriptions since last login
 *   5. Quick Actions       – write prescription / view record / message
 *   6. Analytics           – patient load trend + top flagged conditions
 *
 * All data below is MOCKED. Each section has a // TODO marking exactly
 * where to swap in a real API call once the doctor-side backend routes
 * exist.
 * ------------------------------------------------------------
 */

// ---------- Mock data (replace with API calls) ----------

// Static presentation only — icon + colours per stat card. The `value` and
// `sub` are computed from live data in the component, and each card wires up a
// real action (scroll to a section, open a modal, pop the message dropdown).
const STAT_META = {
  appointments: {
    icon: CalendarClock,
    accent: "text-sky-300",
    iconBg: "bg-sky-900/40",
  },
  "pending-reports": {
    icon: ClipboardList,
    accent: "text-amber-300",
    iconBg: "bg-amber-900/40",
  },
  critical: {
    icon: AlertTriangle,
    accent: "text-rose-300",
    iconBg: "bg-rose-900/40",
  },
  messages: {
    icon: MessageSquare,
    accent: "text-indigo-300",
    iconBg: "bg-indigo-900/40",
  },
};

// Shown until GET /api/appointments/doctor/queue returns rows (fresh DB, or
// logged in as a doctor with no seeded queue). `patientId: null` marks a row
// with no real patient account — records open in demo mode, messaging is off.
const FALLBACK_QUEUE = [
  {
    id: "f1",
    time: "09:00",
    status: "done",
    chiefComplaint: "Follow-up: hypertension",
    patientId: null,
    patientName: "Ananya Raghavan",
    patientAge: 34,
    patientSex: "F",
  },
  {
    id: "f2",
    time: "09:45",
    status: "done",
    chiefComplaint: "Chest pain evaluation",
    patientId: null,
    patientName: "Karthik Subramaniam",
    patientAge: 52,
    patientSex: "M",
  },
  {
    id: "f3",
    time: "10:30",
    status: "in-progress",
    chiefComplaint: "Lab result review",
    patientId: null,
    patientName: "Priya Menon",
    patientAge: 28,
    patientSex: "F",
  },
  {
    id: "f4",
    time: "11:15",
    status: "waiting",
    chiefComplaint: "Diabetes management",
    patientId: null,
    patientName: "Rahul Iyer",
    patientAge: 45,
    patientSex: "M",
  },
  {
    id: "f5",
    time: "12:00",
    status: "waiting",
    chiefComplaint: "Post-op check-in",
    patientId: null,
    patientName: "Divya Nair",
    patientAge: 61,
    patientSex: "F",
  },
];

// Shown until GET /api/medical-reports/flagged returns rows (fresh DB).
const FALLBACK_ALERTS = [
  {
    id: 1,
    patient: "Karthik Subramaniam",
    metric: "Troponin-I",
    value: "0.8 ng/mL",
    flag: "critical",
    reportDate: "Today",
  },
  {
    id: 2,
    patient: "Rahul Iyer",
    metric: "HbA1c",
    value: "9.4%",
    flag: "high",
    reportDate: "Yesterday",
  },
  {
    id: 3,
    patient: "Divya Nair",
    metric: "WBC Count",
    value: "2.1 x10^9/L",
    flag: "low",
    reportDate: "Today",
  },
];

// TODO: replace with GET /api/doctor/activity/recent
const RECENT_ACTIVITY = [
  {
    id: 1,
    patient: "Priya Menon",
    type: "report",
    description: "Uploaded blood panel results",
    time: "2h ago",
  },
  {
    id: 2,
    patient: "Ananya Raghavan",
    type: "prescription",
    description: "Prescription filled: Amlodipine 5mg",
    time: "4h ago",
  },
  {
    id: 3,
    patient: "Rahul Iyer",
    type: "report",
    description: "New HbA1c lab report",
    time: "6h ago",
  },
];

// TODO: replace with GET /api/doctor/analytics/patient-load (last 7 days)
const PATIENT_LOAD = [
  { day: "Mon", count: 6 },
  { day: "Tue", count: 9 },
  { day: "Wed", count: 7 },
  { day: "Thu", count: 10 },
  { day: "Fri", count: 8 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 2 },
];

// TODO: replace with GET /api/doctor/analytics/top-conditions
const TOP_CONDITIONS = [
  { label: "Hypertension", count: 14 },
  { label: "Type 2 Diabetes", count: 11 },
  { label: "Elevated Cholesterol", count: 8 },
  { label: "Anemia", count: 5 },
];

// ---------- Small presentational pieces ----------

function formatWhen(value) {
  if (!value) return "";
  if (typeof value === "string" && !/\d{4}-\d{2}-\d{2}/.test(value))
    return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const days = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatTile({ icon: Icon, label, value, sub, accent, iconBg, onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`w-full text-left rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3 ${
        clickable
          ? "transition-all duration-200 hover:border-slate-600 hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          : "cursor-default"
      }`}
    >
      <div
        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg} ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-slate-100 leading-none">
          {value}
        </p>
        <p className="text-sm text-slate-300 mt-1 truncate">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
      </div>
    </button>
  );
}

const STATUS_STYLES = {
  waiting: "bg-slate-700/60 text-slate-300",
  "in-progress": "bg-amber-900/40 text-amber-300",
  done: "bg-emerald-900/40 text-emerald-300",
};

function AppointmentRow({ appt, onView, onPrescribe, onMessage }) {
  const hasAccount = Boolean(appt.patientId);
  const meta = [
    appt.patientAge != null ? String(appt.patientAge) : null,
    appt.patientSex,
  ]
    .filter(Boolean)
    .join("");
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="w-14 shrink-0 text-xs text-slate-400 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {appt.time}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-100 truncate">
          {appt.patientName}
          {meta && (
            <span className="text-slate-500 font-normal"> · {meta}</span>
          )}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {appt.chiefComplaint || "—"}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onView(appt)}
          className="rounded-lg border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-violet-500/50 hover:text-violet-300"
          title="View records"
          aria-label={`View records for ${appt.patientName}`}
        >
          <FileText className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPrescribe(appt)}
          disabled={!hasAccount}
          className="rounded-lg border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-violet-500/50 hover:text-violet-300 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-400"
          title={
            hasAccount
              ? "Write prescription"
              : "Demo patient — no account to prescribe for"
          }
          aria-label={`Write prescription for ${appt.patientName}`}
        >
          <NotebookPen className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onMessage(appt)}
          disabled={!hasAccount}
          className="rounded-lg border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-teal-500/50 hover:text-teal-300 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-400"
          title={
            hasAccount
              ? "Message patient"
              : "Demo patient — no account to message"
          }
          aria-label={`Message ${appt.patientName}`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </button>
      </div>
      <span
        className={`text-eyebrow px-2 py-1 rounded-full shrink-0 ${
          STATUS_STYLES[appt.status] || "bg-slate-700/60 text-slate-300"
        }`}
      >
        {String(appt.status || "").replace("-", " ")}
      </span>
    </div>
  );
}

const FLAG_STYLES = {
  critical: "border-rose-500/40 bg-rose-950/30",
  high: "border-amber-500/40 bg-amber-950/20",
  low: "border-sky-500/40 bg-sky-950/20",
};

const FLAG_LABEL = {
  critical: "Critical",
  high: "High",
  low: "Low",
};

function AlertRow({ alert }) {
  return (
    <div
      className={`rounded-xl border p-3 mb-2 last:mb-0 ${FLAG_STYLES[alert.flag]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-100 truncate">
          {alert.patient}
        </p>
        <span className="text-eyebrow text-rose-300 shrink-0">
          {FLAG_LABEL[alert.flag]}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-1">
        {alert.metric}: <span className="text-slate-200">{alert.value}</span>
      </p>
      <p className="text-[11px] text-slate-500 mt-0.5">{alert.reportDate}</p>
    </div>
  );
}

function ActivityRow({ item }) {
  const Icon = item.type === "report" ? FileText : Pill;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-100 truncate">{item.patient}</p>
        <p className="text-xs text-slate-400 truncate">{item.description}</p>
      </div>
      <span className="text-[11px] text-slate-500 shrink-0">{item.time}</span>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-between gap-2
        rounded-xl border border-slate-800 bg-slate-900/60
        px-4 py-3 text-left
        hover:border-slate-700 hover:bg-slate-900
        transition-colors duration-200
      "
    >
      <span className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-lg bg-indigo-900/40 text-indigo-300 flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm text-slate-200">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-slate-500" />
    </button>
  );
}

// Small modal shown by the "Write Prescription" Quick Action when no specific
// patient row was clicked — pick who the prescription is for.
function PatientPickerModal({ queue, onPick, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-teal-500" />
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold text-slate-100">Write prescription for…</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto px-3 pb-3">
          {queue.map((appt) => (
            <button
              key={appt.id}
              disabled={!appt.patientId}
              onClick={() => onPick(appt)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-left transition-colors hover:border-violet-500/50 hover:bg-slate-900 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:bg-slate-900/60"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-slate-100">
                  {appt.patientName}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {appt.time} · {appt.chiefComplaint || "—"}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Simple list of reports still awaiting review (GET /api/medical-reports/pending).
function PendingReportsModal({ reports, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
        <div className="flex flex-shrink-0 items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-900/40 text-amber-300">
              <ClipboardList size={18} />
            </div>
            <h2 className="font-bold text-slate-100">
              Reports Awaiting Review
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No reports awaiting review.
            </p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-100">{r.patientName}</p>
                    <span className="text-eyebrow shrink-0 rounded-full bg-amber-900/40 px-2 py-0.5 text-amber-300">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {r.originalFilename || "Report"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatWhen(r.createdAt || r.documentDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState(FALLBACK_QUEUE);
  const [criticalAlerts, setCriticalAlerts] = useState(FALLBACK_ALERTS);
  const [pendingReports, setPendingReports] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [notebookPatient, setNotebookPatient] = useState(null);
  const [recordsPatient, setRecordsPatient] = useState(null);
  const [messagePatient, setMessagePatient] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [highlight, setHighlight] = useState(null); // "queue" | "alerts" | null

  const inboxRef = useRef(null);

  // Live doctor-side data. Each falls back gracefully (fresh DB / no seed) so
  // the dashboard always renders.
  useEffect(() => {
    getDoctorQueue()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) setQueue(rows);
      })
      .catch(() => {});
    getFlaggedReports()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) setCriticalAlerts(rows);
      })
      .catch(() => {});
    getPendingReports()
      .then((rows) => setPendingReports(Array.isArray(rows) ? rows : []))
      .catch(() => {});
  }, []);

  const maxLoad = Math.max(...PATIENT_LOAD.map((d) => d.count));

  // The "active" patient the View Record / Message Quick Actions act on:
  // whoever the doctor is currently seeing, else the next one waiting.
  const activeAppt =
    queue.find((a) => a.status === "in-progress") ||
    queue.find((a) => a.status === "waiting") ||
    queue[0];

  const nextAppt =
    queue.find((a) => a.status === "in-progress") ||
    queue.find((a) => a.status === "waiting");

  function scrollToSection(which) {
    const el = document.getElementById(
      which === "queue" ? "queue-card" : "alerts-card",
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(which);
    setTimeout(() => setHighlight((h) => (h === which ? null : h)), 2000);
  }

  const statCards = [
    {
      id: "appointments",
      label: "Today's Appointments",
      value: queue.length,
      sub: nextAppt ? `Next: ${nextAppt.time}` : "None upcoming",
      onClick: () => scrollToSection("queue"),
    },
    {
      id: "pending-reports",
      label: "Pending Reports",
      value: pendingReports.length,
      sub: "Awaiting review",
      onClick: () => setPendingOpen(true),
    },
    {
      id: "critical",
      label: "Critical Alerts",
      value: criticalAlerts.length,
      sub: "Needs action",
      onClick: () => scrollToSection("alerts"),
    },
    {
      id: "messages",
      label: "Unread Messages",
      value: unreadCount,
      sub: "From patients",
      onClick: () => inboxRef.current?.open(),
    },
  ];

  function openRecords(appt) {
    setRecordsPatient({
      patientId: appt.patientId,
      name: appt.patientName,
      fallback: { age: appt.patientAge, sex: appt.patientSex },
    });
  }

  function openMessage(appt) {
    if (!appt.patientId) return;
    setMessagePatient({
      id: appt.patientId,
      name: appt.patientName,
      role: "patient",
    });
  }

  // Open the Prescription Notebook for a specific queue row, pre-filled with
  // that patient's real id/name/age/sex. Real patient accounts only.
  function openNotebook(appt) {
    if (!appt?.patientId) return;
    setNotebookPatient({
      patientId: appt.patientId,
      name: appt.patientName,
      age: appt.patientAge,
      sex: appt.patientSex,
    });
  }

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-slate-950 overflow-hidden">
        {/* Background decoration so the page doesn't feel flat */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-fuchsia-700/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Doctor Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                Welcome, Dr. {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <ThemeToggle />
              <MessageInboxBell ref={inboxRef} onCountChange={setUnreadCount} />
              <NotificationBell />
              {/* TODO: hook up logout(), same as PatientDashboard */}
              <button className="text-sm text-red-400">Log out</button>
            </div>
          </div>

          {/* Stats strip — each card is now a real action + live number */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <StatTile key={s.id} {...STAT_META[s.id]} {...s} />
            ))}
          </div>

          {/*
            Row: Patient Queue (2/3) + Critical Alerts (1/3).
            Both are DIRECT grid children (no wrapper div) so `items-stretch`
            plus `fullHeight` (shared FULL_HEIGHT on SectionCard) makes the pair
            exactly the same height regardless of content length. Critical
            Alerts usually has fewer rows than the queue — rather than stretch
            the alert rows to fill the gap, the list keeps its natural size and
            a subtle empty-state panel fills the leftover space intentionally.
          */}
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <SectionCard
              id="queue-card"
              className={`lg:col-span-2 ${
                highlight === "queue" ? "ring-2 ring-sky-400/60" : ""
              }`}
              icon={Users}
              title="Today's Patient Queue"
              accent="from-sky-500 to-blue-500"
              iconBg="bg-sky-900/40 text-sky-300"
              fullHeight
            >
              <div>
                {queue.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    onView={openRecords}
                    onPrescribe={openNotebook}
                    onMessage={openMessage}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              id="alerts-card"
              className={
                highlight === "alerts" ? "ring-2 ring-rose-400/60" : ""
              }
              icon={AlertTriangle}
              title="Critical Alerts"
              accent="from-rose-500 to-red-500"
              iconBg="bg-rose-900/40 text-rose-300"
              fullHeight
            >
              <div className="flex flex-1 flex-col">
                <div className="flex-shrink-0">
                  {criticalAlerts.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} />
                  ))}
                </div>
                {criticalAlerts.length < 4 && (
                  <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700/70 px-4 py-6 text-center min-h-[6rem]">
                    <ShieldCheck className="h-5 w-5 text-slate-600" />
                    <p className="text-xs text-slate-500">
                      {criticalAlerts.length === 0
                        ? "No critical alerts"
                        : "No further alerts"}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      You're all caught up
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Row: Recent Activity + Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <SectionCard
              icon={FolderOpen}
              title="Recent Patient Activity"
              accent="from-emerald-500 to-teal-500"
              iconBg="bg-emerald-900/40 text-emerald-300"
              fullHeight
            >
              <div>
                {RECENT_ACTIVITY.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={Stethoscope}
              title="Quick Actions"
              accent="from-indigo-500 to-blue-500"
              iconBg="bg-indigo-900/40 text-indigo-300"
              fullHeight
            >
              <div className="space-y-2">
                <QuickActionButton
                  icon={Pill}
                  label="Write Prescription"
                  onClick={() => setPickerOpen(true)}
                />
                <QuickActionButton
                  icon={FileText}
                  label="View Patient Record"
                  onClick={() => activeAppt && openRecords(activeAppt)}
                />
                <QuickActionButton
                  icon={MessageSquare}
                  label="Message Patient"
                  onClick={() => activeAppt && openMessage(activeAppt)}
                />
              </div>
            </SectionCard>
          </div>

          {/* Row: Analytics */}
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <SectionCard
              icon={TrendingUp}
              title="Patient Load — Last 7 Days"
              accent="from-violet-500 to-purple-500"
              iconBg="bg-violet-900/40 text-violet-300"
              fullHeight
            >
              <div className="flex items-end gap-3 h-32 pt-2">
                {PATIENT_LOAD.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-violet-600/70 to-purple-400/70"
                      style={{ height: `${(d.count / maxLoad) * 100}%` }}
                    />
                    <span className="text-[11px] text-slate-500">{d.day}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={ClipboardList}
              title="Top Flagged Conditions"
              accent="from-amber-500 to-orange-500"
              iconBg="bg-amber-900/40 text-amber-300"
              fullHeight
            >
              <div className="space-y-3">
                {TOP_CONDITIONS.map((c) => (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-200">{c.label}</span>
                      <span className="text-slate-500">{c.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                        style={{
                          width: `${(c.count / TOP_CONDITIONS[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {pickerOpen && (
          <PatientPickerModal
            queue={queue}
            onClose={() => setPickerOpen(false)}
            onPick={(appt) => {
              setPickerOpen(false);
              openNotebook(appt);
            }}
          />
        )}

        {pendingOpen && (
          <PendingReportsModal
            reports={pendingReports}
            onClose={() => setPendingOpen(false)}
          />
        )}

        {notebookPatient && (
          <PrescriptionNotebook
            patient={notebookPatient}
            doctorName={user?.name}
            onClose={() => setNotebookPatient(null)}
            onSave={async (prescription) => {
              // Always a real patient id here — openNotebook() guards against
              // demo rows, so this hits POST /api/prescriptions/written.
              await createWrittenPrescription({
                patient_id: notebookPatient.patientId,
                prescribed_date: prescription.prescribed_date,
                medicines: prescription.medicines,
                notes: prescription.notes,
              });
            }}
          />
        )}

        {recordsPatient && (
          <PatientRecordsPanel
            patientId={recordsPatient.patientId}
            patientName={recordsPatient.name}
            fallback={recordsPatient.fallback}
            onClose={() => setRecordsPatient(null)}
          />
        )}

        {messagePatient && (
          <MessageComposer
            recipient={messagePatient}
            onClose={() => setMessagePatient(null)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
