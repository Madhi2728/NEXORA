import {
  Users,
  Stethoscope,
  UserCheck,
  UserX,
  BadgeAlert,
  CalendarClock,
  Pill,
  MessageSquare,
} from "lucide-react";
import { useAdminStats } from "../../hooks/useAdmin";
import { StatePanel } from "./shared";

const CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    accent: "text-sky-300",
    iconBg: "bg-sky-900/40",
  },
  {
    key: "doctors",
    label: "Doctors",
    icon: Stethoscope,
    accent: "text-violet-300",
    iconBg: "bg-violet-900/40",
  },
  {
    key: "activeUsers",
    label: "Active",
    icon: UserCheck,
    accent: "text-emerald-300",
    iconBg: "bg-emerald-900/40",
  },
  {
    key: "suspendedUsers",
    label: "Suspended",
    icon: UserX,
    accent: "text-rose-300",
    iconBg: "bg-rose-900/40",
  },
  {
    key: "pendingVerifications",
    label: "Pending Verifications",
    icon: BadgeAlert,
    accent: "text-amber-300",
    iconBg: "bg-amber-900/40",
  },
  {
    key: "appointmentsToday",
    label: "Appointments Today",
    icon: CalendarClock,
    accent: "text-indigo-300",
    iconBg: "bg-indigo-900/40",
  },
  {
    key: "prescriptions",
    label: "Prescriptions",
    icon: Pill,
    accent: "text-teal-300",
    iconBg: "bg-teal-900/40",
  },
  {
    key: "chatMessages",
    label: "Chatbot Messages",
    icon: MessageSquare,
    accent: "text-fuchsia-300",
    iconBg: "bg-fuchsia-900/40",
  },
];

export default function AdminStatCards() {
  const { data, loading, error } = useAdminStats();
  const kpis = data?.kpis;

  return (
    <StatePanel loading={loading} error={error} isEmpty={!kpis}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CARDS.map(({ key, label, icon: Icon, accent, iconBg }) => (
          <div
            key={key}
            className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${accent}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none text-slate-100">
                {kpis?.[key] ?? 0}
              </p>
              <p className="mt-1 truncate text-xs text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </StatePanel>
  );
}
