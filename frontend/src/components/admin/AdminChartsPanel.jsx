import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, CalendarRange, PieChart as PieIcon } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useAdminStats } from "../../hooks/useAdmin";
import { StatePanel } from "./shared";

const AXIS = { stroke: "#64748b", fontSize: 11 };
const GRID = "#1e293b";
const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};
const ROLE_COLORS = { patient: "#38bdf8", doctor: "#a78bfa", admin: "#fbbf24" };

const shortDay = (d) => (d ? d.slice(5) : "");

export default function AdminChartsPanel() {
  const { data, loading, error } = useAdminStats();

  const signups = data?.signups || [];
  const appts = data?.appointmentsPerDay || [];
  const roles = (data?.roleDistribution || []).filter((r) => r.count > 0);

  return (
    <StatePanel loading={loading} error={error} isEmpty={!data}>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          icon={TrendingUp}
          title="Sign-ups — last 30 days"
          accent="from-violet-500 to-purple-500"
          iconBg="bg-violet-900/40 text-violet-300"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={signups}
                margin={{ top: 6, right: 10, bottom: 0, left: -18 }}
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDay}
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
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(d) => `Date ${d}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          icon={CalendarRange}
          title="Appointments per day"
          accent="from-sky-500 to-blue-500"
          iconBg="bg-sky-900/40 text-sky-300"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={appts}
                margin={{ top: 6, right: 10, bottom: 0, left: -18 }}
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDay}
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
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "#1e293b66" }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          icon={PieIcon}
          title="Role distribution"
          accent="from-amber-500 to-orange-500"
          iconBg="bg-amber-900/40 text-amber-300"
        >
          {roles.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No users yet.
            </p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roles}
                    dataKey="count"
                    nameKey="role"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={2}
                    label={(e) => `${e.role} (${e.count})`}
                    labelLine={false}
                    fontSize={11}
                    stroke="none"
                  >
                    {roles.map((r) => (
                      <Cell
                        key={r.role}
                        fill={ROLE_COLORS[r.role] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>
    </StatePanel>
  );
}
