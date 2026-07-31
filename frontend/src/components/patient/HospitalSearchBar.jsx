import { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

export default function HospitalSearchBar({ hospitals, onSelectHospital, onGoToPlace }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const matches = query.trim()
    ? hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          h.address.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  async function handleSearchPlace() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          query.trim()
        )}`
      );
      const data = await res.json();
      if (!data.length) {
        setError("Location not found. Try a different place or city name.");
        return;
      }
      onGoToPlace([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (err) {
      setError("Could not search that location right now.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchPlace())}
          placeholder="Search a hospital/clinic name, or a place/city..."
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        <button
          onClick={handleSearchPlace}
          disabled={searching || !query.trim()}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 flex-shrink-0"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {matches.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-700 rounded-lg overflow-hidden max-h-32 overflow-y-auto">
          {matches.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelectHospital(h)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 flex items-center gap-2 text-slate-200"
            >
              <MapPin size={12} className="flex-shrink-0 text-fuchsia-400" />
              <span>
                <span className="font-medium">{h.name}</span> — {h.address}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
