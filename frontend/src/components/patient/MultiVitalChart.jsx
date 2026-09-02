import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SERIES = [
  { key: "blood_pressure_systolic", label: "BP Systolic", color: "#a78bfa" },
  { key: "blood_pressure_diastolic", label: "BP Diastolic", color: "#f472b6" },
  { key: "heart_rate", label: "Heart Rate", color: "#fb7185" },
  { key: "weight", label: "Weight", color: "#fbbf24" },
  { key: "blood_sugar", label: "Blood Sugar", color: "#34d399" },
  { key: "temperature", label: "Temperature", color: "#38bdf8" },
  { key: "spo2", label: "SpO2", color: "#818cf8" },
  { key: "hemoglobin", label: "Hemoglobin", color: "#2dd4bf" },
];

function buildData(vitals) {
  const sorted = [...vitals].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  return sorted.map((v) => {
    const row = {
      date: new Date(v.recorded_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
    if (v.type === "blood_pressure") {
      const [systolic, diastolic] = String(v.value ?? "").split("/").map(Number);
      row.blood_pressure_systolic = systolic;
      row.blood_pressure_diastolic = diastolic;
    } else {
      row[v.type] = Number(v.value);
    }
    return row;
  });
}

export default function MultiVitalChart({ vitals }) {
  const rows = Array.isArray(vitals) ? vitals : [];
  if (!rows.length) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-sm p-6 text-sm text-slate-400 text-center">
        No readings yet. Log one below to see the trend here.
      </div>
    );
  }

  const data = buildData(rows);

  const presentKeys = new Set();
  rows.forEach((v) => {
    if (v.type === "blood_pressure") {
      presentKeys.add("blood_pressure_systolic");
      presentKeys.add("blood_pressure_diastolic");
    } else {
      presentKeys.add(v.type);
    }
  });

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm p-4 space-y-1">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            {SERIES.filter((s) => presentKeys.has(s.key)).map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-500 px-1">
        Different metrics use very different scales (e.g. temperature vs. blood pressure) — hover
        a point for the exact reading rather than judging by height alone.
      </p>
    </div>
  );
}
