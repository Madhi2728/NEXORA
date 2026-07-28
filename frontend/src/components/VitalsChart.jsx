// frontend/src/components/VitalsChart.jsx
//
// Chart pulls from the SAME `readings` array as the table (via useVitals),
// so deleting a reading in the table instantly removes its point here too.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const METRIC_COLORS = {
  bloodPressureSystolic: "#a78bfa",
  bloodPressureDiastolic: "#f472b6",
  heartRate: "#fb7185",
  weight: "#fbbf24",
  bloodSugar: "#34d399",
  temperature: "#60a5fa",
  spo2: "#38bdf8",
  hemoglobin: "#f87171",
};

export default function VitalsChart({ readings, activeMetric }) {
  const filtered = readings
    .filter((r) => r.type === activeMetric)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString(),
      value: r.value,
    }));

  if (!filtered.length) {
    return (
      <p className="text-slate-400 text-sm py-8 text-center">
        No {activeMetric} readings yet — log one below to see the trend.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={filtered}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8 }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          name={activeMetric}
          stroke={METRIC_COLORS[activeMetric] || "#a78bfa"}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
