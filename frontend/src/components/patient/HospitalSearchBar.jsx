import { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

export default function HospitalSearchBar({ hospitals, onSelectHospital, onSearchResults }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const localMatches = query.trim()
    ? hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          h.address.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      // Broad, free OpenStreetMap search -- returns real-world places
      // (including real hospitals/clinics if the query matches one),
      // not just our own demo dataset.
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(
          query.trim()
        )}`
      );
      const data = await res.json();
      if (!data.length) {
        setError("Nothing found for that search. Try a different name or place.");
        onSearchResults([]);
        return;
      }
      onSearchResults(data);
    } catch (err) {
      setError("Could not search right now.");
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
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
          placeholder="Search hospitals, clinics, or a place/city..."
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 flex-shrink-0"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {localMatches.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-700 rounded-lg overflow-hidden max-h-32 overflow-y-auto">
          <p className="text-[11px] text-slate-500 px-3 pt-2">Bookable on Nexora:</p>
          {localMatches.map((h) => (
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
