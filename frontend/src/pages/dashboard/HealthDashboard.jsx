import { useEffect, useState, useCallback } from "react";
import { VITAL_TYPES, unitFor } from "../../utils/vitalTypes";
import { addVital, getMyVitals, deleteVital } from "../../services/vitalsService";
import VitalForm from "../../components/patient/VitalForm";
import MultiVitalChart from "../../components/patient/MultiVitalChart";
import AllVitalsTable from "../../components/patient/AllVitalsTable";

export default function HealthDashboard() {
  // activeType now only controls which metric the "Log a reading" form submits as --
  // the chart and table below always show every metric combined.
  const [activeType, setActiveType] = useState(VITAL_TYPES[0].value);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyVitals(); // no type filter -- fetch everything
      setVitals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load your readings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd({ value }) {
    await addVital({ type: activeType, value, unit: unitFor(activeType) });
    load(); // always refresh the full combined dataset, regardless of which type was logged
  }

  async function handleDelete(id) {
    await deleteVital(id);
    load();
  }

  return (
    <div className="space-y-4">

      {/* Metric tabs -- now purely select what the form below logs */}
      <div className="flex flex-wrap gap-2">
        {VITAL_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              activeType === t.value
                ? "bg-violet-600 text-white"
                : "bg-slate-700 text-slate-300 border border-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-slate-800 rounded-xl shadow-sm p-6 text-sm text-slate-400 text-center">
          Loading...
        </div>
      ) : error ? (
        <div className="bg-slate-800 rounded-xl shadow-sm p-6 text-sm text-red-400 text-center">
          {error}
        </div>
      ) : (
        <>
          <MultiVitalChart vitals={vitals} />
          <AllVitalsTable vitals={vitals} onDelete={handleDelete} />
        </>
      )}

      <VitalForm type={activeType} onSubmit={handleAdd} />
    </div>
  );
}
