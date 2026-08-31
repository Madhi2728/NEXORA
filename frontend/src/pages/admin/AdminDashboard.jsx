import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ThemeProvider } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Building2,
  CalendarDays,
  Pill,
  Bot,
  ScrollText,
  Activity,
  FileDown,
  Megaphone,
} from "lucide-react";

import AdminStatCards from "../../components/admin/AdminStatCards";
import AdminChartsPanel from "../../components/admin/AdminChartsPanel";
import UserManagementTable from "../../components/admin/UserManagementTable";
import DoctorVerificationQueue from "../../components/admin/DoctorVerificationQueue";
import HospitalDirectory from "../../components/admin/HospitalDirectory";
import AppointmentsOversight from "../../components/admin/AppointmentsOversight";
import PrescriptionAudit from "../../components/admin/PrescriptionAudit";
import ChatbotMonitor from "../../components/admin/ChatbotMonitor";
import AuditLogTable from "../../components/admin/AuditLogTable";
import SystemHealth from "../../components/admin/SystemHealth";
import ReportsExports from "../../components/admin/ReportsExports";
import AnnouncementComposer from "../../components/admin/AnnouncementComposer";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "verification", label: "Doctor Verification", icon: BadgeCheck },
  { id: "hospitals", label: "Hospitals", icon: Building2 },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "prescriptions", label: "Prescriptions", icon: Pill },
  { id: "ai", label: "AI Monitor", icon: Bot },
  { id: "audit", label: "Audit Log", icon: ScrollText },
  { id: "system", label: "System Health", icon: Activity },
  { id: "reports", label: "Reports", icon: FileDown },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

function Overview() {
  return (
    <div className="space-y-6">
      <AdminStatCards />
      <AdminChartsPanel />
    </div>
  );
}

const PANELS = {
  overview: Overview,
  users: UserManagementTable,
  verification: DoctorVerificationQueue,
  hospitals: HospitalDirectory,
  appointments: AppointmentsOversight,
  prescriptions: PrescriptionAudit,
  ai: ChatbotMonitor,
  audit: AuditLogTable,
  system: SystemHealth,
  reports: ReportsExports,
  announcements: AnnouncementComposer,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState("overview");

  const ActivePanel = PANELS[section];
  const activeLabel = SECTIONS.find((s) => s.id === section)?.label;

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-slate-950 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-fuchsia-700/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:flex-row">
          {/* Sidebar nav */}
          <aside className="lg:w-60 lg:shrink-0">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-slate-100">
                Admin Console
              </h1>
              <p className="text-sm text-slate-400">
                Signed in as {user?.name}
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const active = id === section;
                return (
                  <button
                    key={id}
                    onClick={() => setSection(id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "border-violet-500/50 bg-violet-900/30 text-violet-200"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 hidden items-center gap-4 lg:flex">
              <ThemeToggle />
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Log out
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-bold text-slate-100">
                {activeLabel}
              </h2>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button onClick={logout} className="text-sm text-red-400">
                  Log out
                </button>
              </div>
            </div>
            <ActivePanel />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
