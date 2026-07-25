import { useState } from "react";
import { checkInteractions } from "../../services/drugInteractionService";
import DrugTagInput from "../../components/patient/DrugTagInput";
import InteractionResults from "../../components/patient/InteractionResults";

export default function DrugInteractionChecker() {
  const [drugs, setDrugs] = useState([]);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck() {
    setError("");
    setResult(null);
    if (drugs.length < 2) {
      setError("Add at least two medicines to check.");
      return;
    }
    setChecking(true);
    try {
      const data = await checkInteractions(drugs);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not check interactions.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Drug Interaction Checker</h2>

      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <DrugTagInput drugs={drugs} onChange={setDrugs} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleCheck}
          disabled={checking}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          {checking ? "Checking..." : "Check Interactions"}
        </button>
      </div>

      <InteractionResults result={result} />

      <p className="text-xs text-slate-400">
        Medicine name search covers a broad live list, but interaction checking itself is
        limited to a small set of well-documented pairs — not exhaustive. Always confirm with
        a pharmacist or doctor before starting, stopping, or combining medications.
      </p>
    </div>
  );
}
