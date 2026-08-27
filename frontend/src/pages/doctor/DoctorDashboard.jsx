import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SectionCard from "../../components/common/SectionCard";
import NotificationBell from "../../components/common/NotificationBell";
import PrescriptionNotebook from "../../components/doctor/PrescriptionNotebook";
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

// TODO: replace with GET /api/doctor/stats
const STATS = [
  { id: "appointments", label: "Today's Appointments", value: 8, sub: "Next: 10:30 AM", icon: CalendarClock, accent: "text-sky-300", iconBg: "bg-sky-900/40" },
  { id: "pending-reports", label: "Pending Reports", value: 5, sub: "Awaiting review", icon: ClipboardList, accent: "text-amber-300", iconBg: "bg-amber-900/40" },
  { id: "critical", label: "Critical Alerts", value: 3, sub: "Needs action", icon: AlertTriangle, accent: "text-rose-300", iconBg: "bg-rose-900/40" },
  { id: "messages", label: "Unread Messages", value: 4, sub: "From patients", icon: MessageSquare, accent: "text-indigo-300", iconBg: "bg-indigo-900/40" },
];

// TODO: replace with GET /api/doctor/appointments/today
const APPOINTMENTS_TODAY = [
  { id: 1, time: "09:00 AM", patient: "Ananya Raghavan", age: 34, sex: "F", reason: "Follow-up: hypertension", status: "done" },
  { id: 2, time: "09:45 AM", patient: "Karthik Subramaniam", age: 52, sex: "M", reason: "Chest pain evaluation", status: "done" },
  { id: 3, time: "10:30 AM", patient: "Priya Menon", age: 28, sex: "F", reason: "Lab result review", status: "in-progress" },
  { id: 4, time: "11:15 AM", patient: "Rahul Iyer", age: 45, sex: "M", reason: "Diabetes management", status: "waiting" },
  { id: 5, time: "12:00 PM", patient: "Divya Nair", age: 61, sex: "F", reason: "Post-op check-in", status: "waiting" },
];

// TODO: replace with GET /api/doctor/alerts/critical
const CRITICAL_ALERTS = [
  { id: 1, patient: "Karthik Subramaniam", metric: "Troponin-I", value: "0.8 ng/mL", flag: "critical", reportDate: "Today" },
  { id: 2, patient: "Rahul Iyer", metric: "HbA1c", value: "9.4%", flag: "high", reportDate: "Yesterday" },
  { id: 3, patient: "Divya Nair", metric: "WBC Count", value: "2.1 x10^9/L", flag: "low", reportDate: "Today" },
];

// TODO: replace with GET /api/doctor/activity/recent
const RECENT_ACTIVITY = [
  { id: 1, patient: "Priya Menon", type: "report", description: "Uploaded blood panel results", time: "2h ago" },
  { id: 2, patient: "Ananya Raghavan", type: "prescription", description: "Prescription filled: Amlodipine 5mg", time: "4h ago" },
  { id: 3, patient: "Rahul Iyer", type: "report", description: "New HbA1c lab report", time: "6h ago" },
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

function StatTile({ icon: Icon, label, value, sub, accent, iconBg }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg} ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-slate-100 leading-none">{value}</p>
        <p className="text-sm text-slate-300 mt-1 truncate">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  waiting: "bg-slate-700/60 text-slate-300",
  "in-progress": "bg-amber-900/40 text-amber-300",
  done: "bg-emerald-900/40 text-emerald-300",
};

function AppointmentRow({ appt }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="w-16 shrink-0 text-xs text-slate-400 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {appt.time}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-100 truncate">
          {appt.patient} <span className="text-slate-500 font-normal">· {appt.age}{appt.sex}</span>
        </p>
        <p className="text-xs text-slate-400 truncate">{appt.reason}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full shrink-0 capitalize ${STATUS_STYLES[appt.status]}`}>
        {appt.status.replace("-", " ")}
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
    <div className={`rounded-xl border p-3 mb-2 last:mb-0 ${FLAG_STYLES[alert.flag]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-100 truncate">{alert.patient}</p>
        <span className="text-[11px] uppercase tracking-wide text-rose-300 shrink-0">
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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [notebookOpen, setNotebookOpen] = useState(false);

  const maxLoad = Math.max(...PATIENT_LOAD.map((d) => d.count));

  // The "active" patient the Prescription Notebook writes for: whoever the
  // doctor is currently seeing, else the next one waiting, else the first slot.
  // TODO: replace with a real selection once the queue is interactive.
  const activeAppt =
    APPOINTMENTS_TODAY.find((a) => a.status === "in-progress") ||
    APPOINTMENTS_TODAY.find((a) => a.status === "waiting") ||
    APPOINTMENTS_TODAY[0];
  const activePatient = activeAppt
    ? { name: activeAppt.patient, age: activeAppt.age, sex: activeAppt.sex }
    : null;

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
              <h1 className="text-xl font-semibold text-slate-100">Doctor Dashboard</h1>
              <p className="text-sm text-slate-400">Welcome, Dr. {user?.name}</p>
            </div>
            <div className="flex items-center gap-5">
              <ThemeToggle />
              <NotificationBell />
              {/* TODO: hook up logout(), same as PatientDashboard */}
              <button className="text-sm text-red-400">Log out</button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <StatTile key={s.id} {...s} />
            ))}
          </div>

          {/*
            Row: Patient Queue (2/3) + Critical Alerts (1/3).
            `grid ... items-stretch` + `fullHeight` on both SectionCards keeps
            the pair exactly the same height regardless of content length (see
            SectionCard's FULL_HEIGHT note). Critical Alerts usually has fewer
            rows than the queue — rather than stretch the alert rows to fill the
            gap, we let the list keep its natural size and drop a quiet
            empty-state into the leftover space at the bottom.
          */}
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <SectionCard
                icon={Users}
                title="Today's Patient Queue"
                accent="from-sky-500 to-blue-500"
                iconBg="bg-sky-900/40 text-sky-300"
                fullHeight
              >
                <div>
                  {APPOINTMENTS_TODAY.map((appt) => (
                    <AppointmentRow key={appt.id} appt={appt} />
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard
              icon={AlertTriangle}
              title="Critical Alerts"
              accent="from-rose-500 to-red-500"
              iconBg="bg-rose-900/40 text-rose-300"
              fullHeight
            >
              <div className="flex flex-1 flex-col">
                <div>
                  {CRITICAL_ALERTS.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} />
                  ))}
                </div>
                <div className="mt-auto flex flex-col items-center justify-center gap-1.5 py-8 text-center">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                  <p className="text-xs text-slate-600">No further alerts</p>
                </div>
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
                  onClick={() => setNotebookOpen(true)}
                />
                {/* TODO: wire these to real navigation / modals */}
                <QuickActionButton icon={FileText} label="View Patient Record" onClick={() => {}} />
                <QuickActionButton icon={MessageSquare} label="Message Patient" onClick={() => {}} />
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
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
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
                        style={{ width: `${(c.count / TOP_CONDITIONS[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {notebookOpen && (
          <PrescriptionNotebook
            patient={activePatient}
            doctorName={user?.name}
            onClose={() => setNotebookOpen(false)}
            // TODO: swap for a real POST once /api/prescriptions/written exists.
            onSave={async (prescription) => {
              console.log("Prescription saved (stub):", prescription);
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
