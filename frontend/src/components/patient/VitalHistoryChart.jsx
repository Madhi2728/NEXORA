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
      <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-slate-500 text-center">
        No readings yet for this metric. Log one above to see the trend here.
      </div>
    );
  }

  const data = buildChartData(vitals, type);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {type === "blood_pressure" ? (
            <>
              <Legend />
              <Line type="monotone" dataKey="systolic" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            </>
          ) : (
            <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
