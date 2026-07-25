import { useEffect, useState, useCallback } from "react";
import { VITAL_TYPES } from "../../utils/vitalTypes";
import { addVital, getMyVitals, deleteVital } from "../../services/vitalsService";
import VitalForm from "../../components/patient/VitalForm";
import VitalHistoryChart from "../../components/patient/VitalHistoryChart";
import VitalTable from "../../components/patient/VitalTable";

export default function HealthDashboard() {
  const [activeType, setActiveType] = useState(VITAL_TYPES[0].value);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (type) => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyVitals(type);
      setVitals(data);
    } catch (err) {
      setError("Could not load your readings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeType);
  }, [activeType, load]);

  async function handleAdd(payload) {
    await addVital(payload);
    if (payload.type === activeType) {
      load(activeType);
    }
  }

  async function handleDelete(id) {
    await deleteVital(id);
    load(activeType);
  }

  return (
    <div className="space-y-4">

      {/* Metric tabs */}
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

      <div className="space-y-4">
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
            <VitalHistoryChart vitals={vitals} type={activeType} />
            <VitalTable vitals={vitals} onDelete={handleDelete} />
          </>
        )}

        <VitalForm onSubmit={handleAdd} />
      </div>
    </div>
  );
}
