import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Bot, ShieldAlert, Gauge, Repeat, MessageSquare } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useAdminChatbotMetrics } from "../../hooks/useAdmin";
import { StatePanel, formatDate } from "./shared";

const AXIS = { stroke: "#64748b", fontSize: 11 };
const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};

const TILES = [
  {
    key: "messages",
    label: "Messages (30d)",
    icon: MessageSquare,
    tone: "text-sky-300 bg-sky-900/40",
  },
  {
    key: "rateLimited",
    label: "Rate-limit hits",
    icon: Gauge,
    tone: "text-amber-300 bg-amber-900/40",
  },
  {
    key: "crisisFlags",
    label: "Crisis flags",
    icon: ShieldAlert,
    tone: "text-rose-300 bg-rose-900/40",
  },
  {
    key: "providerFallbacks",
    label: "Provider fallbacks",
    icon: Repeat,
    tone: "text-violet-300 bg-violet-900/40",
  },
];

export default function ChatbotMonitor() {
  const { data, loading, error } = useAdminChatbotMetrics();

  const totals = data?.totals || {};
  const volume = data?.volume || [];
  const crisisEvents = data?.crisisEvents || [];
  const providerCounts = data?.providerCounts || {};

  return (
    <div className="space-y-6">
      <StatePanel loading={loading} error={error} isEmpty={!data}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TILES.map(({ key, label, icon: Icon, tone }) => (
            <div
              key={key}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-slate-100">
                  {totals[key] ?? 0}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            icon={Bot}
            title="Message volume — last 30 days"
            accent="from-indigo-500 to-blue-500"
            iconBg="bg-indigo-900/40 text-indigo-300"
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={volume}
                  margin={{ top: 6, right: 10, bottom: 0, left: -18 }}
                >
                  <defs>
                    <linearGradient id="chatVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={AXIS}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={AXIS}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#chatVol)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {Object.keys(providerCounts).length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Provider mix:{" "}
                {Object.entries(providerCounts)
                  .map(([p, c]) => `${p} ${c}`)
                  .join(" · ")}
              </p>
            )}
          </SectionCard>

          <SectionCard
            icon={ShieldAlert}
            title="Crisis-flag events"
            accent="from-rose-500 to-red-500"
            iconBg="bg-rose-900/40 text-rose-300"
            fullHeight
          >
            {crisisEvents.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No crisis-pattern messages detected. That's good news.
              </p>
            ) : (
              <div className="space-y-2">
                {crisisEvents.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-rose-100">
                        {e.userName}
                      </p>
                      <span className="text-eyebrow rounded-full bg-rose-900/50 px-2 py-0.5 text-rose-200">
                        {e.crisisType}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-rose-300/80">
                      {formatDate(e.createdAt, true)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </StatePanel>
    </div>
  );
}
