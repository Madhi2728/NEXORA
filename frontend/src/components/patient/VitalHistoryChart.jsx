import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Converts raw vitals (newest-first) into ascending chart points.
// Blood pressure values look like "120/80" and get split into two lines.
function buildChartData(vitals, type) {
  const sorted = [...vitals].reverse();

  if (type === "blood_pressure") {
    return sorted.map((v) => {
      const [systolic, diastolic] = v.value.split("/").map(Number);
      return {
        date: new Date(v.recorded_at).toLocaleDateString(),
        systolic,
        diastolic,
      };
    });
  }

  return sorted.map((v) => ({
    date: new Date(v.recorded_at).toLocaleDateString(),
    value: Number(v.value),
  }));
}

export default function VitalHistoryChart({ vitals, type }) {
  if (!vitals.length) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-sm p-6 text-sm text-slate-400 text-center">
        No readings yet for this metric. Log one above to see the trend here.
      </div>
    );
  }

  const data = buildChartData(vitals, type);

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} itemStyle={{ color: "#e2e8f0" }} />
          {type === "blood_pressure" ? (
            <>
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Line type="monotone" dataKey="systolic" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#fb923c" strokeWidth={2} dot={{ r: 3 }} />
            </>
          ) : (
            <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
