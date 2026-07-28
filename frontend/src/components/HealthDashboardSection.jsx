// frontend/src/components/HealthDashboardSection.jsx
//
// Drop this in place of your current "Health Dashboard" card contents.
// It wires the metric tabs, chart, and table to one shared data source.

import { useState } from "react";
import { useVitals } from "../hooks/useVitals";
import VitalsChart from "./VitalsChart";
import ReadingsTable from "./ReadingsTable";

const METRICS = [
  { key: "bloodPressureSystolic", label: "Blood Pressure" }, // combine systolic/diastolic in chart if you like
  { key: "heartRate", label: "Heart Rate" },
  { key: "weight", label: "Weight" },
  { key: "bloodSugar", label: "Blood Sugar" },
  { key: "temperature", label: "Temperature" },
  { key: "spo2", label: "SpO2" },
  { key: "hemoglobin", label: "Hemoglobin" },
];

export default function HealthDashboardSection({ patientId }) {
  const { readings, loading, error, deleteReading } = useVitals(patientId);
  const [activeMetric, setActiveMetric] = useState("bloodSugar");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              activeMetric === m.key
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading readings…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          <VitalsChart readings={readings} activeMetric={activeMetric} />
          <ReadingsTable
            readings={readings.filter((r) => r.type === activeMetric)}
            onDelete={deleteReading}
          />
        </>
      )}
    </div>
  );
}
