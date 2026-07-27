import { useEffect, useState } from "react";
import { Search, Pill, Syringe, Wind, Droplet } from "lucide-react";
import { getMedicineInfo } from "../../services/medicineInfoService";
import { searchMedicines } from "../../services/drugInteractionService";
import ExpandableText from "../../components/patient/ExpandableText";

const CATEGORY_STYLE = {
  tablet: { icon: Pill, cls: "bg-violet-900/40 text-violet-300" },
  capsule: { icon: Pill, cls: "bg-indigo-900/40 text-indigo-300" },
  injection: { icon: Syringe, cls: "bg-rose-900/40 text-rose-300" },
  inhaler: { icon: Wind, cls: "bg-sky-900/40 text-sky-300" },
  liquid: { icon: Droplet, cls: "bg-amber-900/40 text-amber-300" },
};

export default function MedicineInfoLookup() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [notFoundMsg, setNotFoundMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchMedicines(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSearch(name) {
    const term = (name || query).trim();
    if (!term) return;

    setError("");
    setResult(null);
    setNotFoundMsg("");
    setShowSuggestions(false);
    setLoading(true);

    try {
      const data = await getMedicineInfo(term);
      setResult(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFoundMsg(err.response.data.message);
        setResult(err.response.data); // still has category/commonUse if we know it locally
      } else {
        setError(err.response?.data?.message || "Could not look up this medicine.");
      }
    } finally {
      setLoading(false);
    }
  }

  const style = CATEGORY_STYLE[result?.category] || CATEGORY_STYLE.tablet;
  const Icon = style.icon;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Search a medicine name (brand or generic)..."
            className="flex-1 rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5"
          >
            <Search size={15} /> Search
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden max-h-56 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setQuery(s.name);
                  handleSearch(s.name);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 text-slate-200"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading && <p className="text-sm text-slate-500 text-center">Looking up...</p>}

      {result && !loading && (
        <div className="bg-slate-900/40 rounded-xl border border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${style.cls}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-100">
                {result.brandName || result.genericName || query}
              </p>
              {result.genericName && result.brandName && (
                <p className="text-xs text-slate-500">Generic: {result.genericName}</p>
              )}
            </div>
          </div>

          {notFoundMsg ? (
            <div className="text-sm text-amber-300 bg-amber-900/30 border border-amber-800 rounded-lg p-3">
              {notFoundMsg}
              {result.commonUse && (
                <p className="mt-1 text-slate-300">Known use: {result.commonUse}</p>
              )}
            </div>
          ) : (
            <>
              <ExpandableText label="Purpose / Indications" text={result.purpose} />
              <ExpandableText label="Dosage" text={result.dosage} />
              <ExpandableText label="Warnings" text={result.warnings} />
              <p className="text-xs text-slate-500 pt-1">Source: {result.source}</p>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Descriptions come from the U.S. FDA's public database (openFDA) and only cover
        FDA-approved products — India-only brands may not appear. This is informational only,
        not a substitute for a pharmacist or doctor.
      </p>
    </div>
  );
}
