import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { searchMedicines } from "../../services/drugInteractionService";

export default function DrugTagInput({ drugs, onChange }) {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search-as-you-type against the backend (local curated list + live RxNorm).
  useEffect(() => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      searchMedicines(text)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [text]);

  function addDrug(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (drugs.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setText("");
      return;
    }
    onChange([...drugs, trimmed]);
    setText("");
    setShowSuggestions(false);
  }

  function removeDrug(name) {
    onChange(drugs.filter((d) => d !== name));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addDrug(text);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {drugs.map((d) => (
          <span
            key={d}
            className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-sm px-3 py-1 rounded-full"
          >
            {d}
            <button onClick={() => removeDrug(d)} className="hover:text-violet-900">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type a medicine name (brand or generic) and press Enter"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => addDrug(s.name)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 flex items-center justify-between gap-2"
              >
                <span>{s.name}</span>
                {s.hasInteractionData && (
                  <span title="Interaction data available" className="text-emerald-500 flex-shrink-0">
                    <ShieldCheck size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
