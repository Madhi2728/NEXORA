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
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-slate-500 text-center">
              Loading...
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-red-600 text-center">
              {error}
            </div>
          ) : (
            <>
              <VitalHistoryChart vitals={vitals} type={activeType} />
              <VitalTable vitals={vitals} onDelete={handleDelete} />
            </>
          )}
        </div>

        <div>
          <VitalForm onSubmit={handleAdd} />
        </div>
      </div>
    </div>
  );
}
