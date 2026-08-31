import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  Database,
  Server,
  Sparkles,
  Timer,
  AlertOctagon,
  Clock,
  Cpu,
  Boxes,
} from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useSystemHealth } from "../../hooks/useAdmin";
import { StatePanel } from "./shared";

const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};
const AXIS = { stroke: "#64748b", fontSize: 11 };

function humaniseUptime(s) {
  if (s == null) return "—";
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

const TONE = {
  green: "bg-emerald-900/40 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-900/40 text-amber-300 border-amber-500/30",
  red: "bg-rose-900/40 text-rose-300 border-rose-500/30",
  grey: "bg-slate-700/50 text-slate-300 border-slate-600/40",
};

function StatusPill({ icon: Icon, label, tone, detail }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${TONE[tone] || TONE.grey}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-none">{label}</p>
        <p className="mt-0.5 truncate text-[11px] opacity-80">{detail}</p>
      </div>
    </div>
  );
}

function aiTone(ok, configured) {
  if (!configured) return { tone: "red", detail: "not configured" };
  if (ok === true) return { tone: "green", detail: "last call OK" };
  if (ok === false) return { tone: "red", detail: "last call failed" };
  return { tone: "amber", detail: "no calls yet" };
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none text-slate-100">{value}</p>
        <p className="mt-1 truncate text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function SystemHealth() {
  const { data, loading, error } = useSystemHealth(30000);

  const db = data?.db;
  const api = data?.api;
  const ai = data?.ai;
  const proc = data?.process;

  const dbTone = db?.connected ? "green" : "red";
  const apiTone = !api ? "grey" : api.error_5xx > 0 ? "amber" : "green";
  const openai = aiTone(ai?.openai_ok, ai?.openai_configured);
  const groq = aiTone(ai?.groq_ok, ai?.groq_configured);

  return (
    <div className="space-y-6">
      <StatePanel loading={loading && !data} error={error} isEmpty={!data}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatusPill
            icon={Database}
            label="Database"
            tone={dbTone}
            detail={db?.connected ? `${db.latency_ms}ms` : "disconnected"}
          />
          <StatusPill
            icon={Server}
            label="API"
            tone={apiTone}
            detail={api ? `${api.requests_24h} req / 24h` : "—"}
          />
          <StatusPill
            icon={Sparkles}
            label="OpenAI"
            tone={openai.tone}
            detail={openai.detail}
          />
          <StatusPill
            icon={Sparkles}
            label="Groq"
            tone={groq.tone}
            detail={groq.detail}
          />
        </div>

        <SectionCard
          icon={Activity}
          title="Request volume — last 24h"
          accent="from-sky-500 to-blue-500"
          iconBg="bg-sky-900/40 text-sky-300"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={api?.series || []}
                margin={{ top: 6, right: 10, bottom: 0, left: -18 }}
              >
                <defs>
                  <linearGradient id="reqVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(h) => (h ? new Date(h).getHours() + "h" : "")}
                  tick={AXIS}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                />
                <YAxis
                  allowDecimals={false}
                  tick={AXIS}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(h) => new Date(h).toLocaleString("en-IN")}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#reqVol)"
                  name="Requests"
                />
                <Area
                  type="monotone"
                  dataKey="errors_5xx"
                  stroke="#fb7185"
                  strokeWidth={2}
                  fill="#fb718533"
                  name="5xx errors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Tile
            icon={Timer}
            label="p95 latency"
            value={api ? `${api.p95_latency_ms}ms` : "—"}
          />
          <Tile
            icon={AlertOctagon}
            label="Errors / 24h"
            value={api ? api.error_4xx + api.error_5xx : "—"}
          />
          <Tile
            icon={Clock}
            label="Uptime"
            value={humaniseUptime(proc?.uptime_seconds)}
          />
          <Tile
            icon={Cpu}
            label="Memory"
            value={proc ? `${proc.memory_mb} MB` : "—"}
          />
          <Tile
            icon={Boxes}
            label="RxNorm cache"
            value={data?.cache ? data.cache.rxnorm_terms.toLocaleString() : "—"}
          />
        </div>

        <p className="text-xs text-slate-600">
          Auto-refreshes every 30s · AI status is last-known (no live API pings)
          · {ai ? `${ai.fallback_count_24h} provider fallback(s) in 24h` : ""}
        </p>
      </StatePanel>
    </div>
  );
}
