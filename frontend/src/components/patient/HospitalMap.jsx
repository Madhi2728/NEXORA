import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

const bookableIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Greyscale-ish marker for real-world search results that aren't yet
// connected to Nexora -- visually distinct from our bookable demo pins.
const infoIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
});

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

const DEFAULT_CENTER = [11.341, 77.7172]; // Erode, Tamil Nadu

const isCoord = (v) => Number.isFinite(Number(v));

export default function HospitalMap({ hospitals, searchResults, onSelect, center, zoom = 13 }) {
  // Leaflet throws on a Marker with null/NaN coordinates — hospitals seeded
  // without lat/long would otherwise blank the whole page.
  const bookable = (Array.isArray(hospitals) ? hospitals : []).filter(
    (h) => isCoord(h?.latitude) && isCoord(h?.longitude)
  );
  const results = (Array.isArray(searchResults) ? searchResults : []).filter(
    (r) => isCoord(r?.lat) && isCoord(r?.lon)
  );
  const safeCenter =
    Array.isArray(center) && center.every(isCoord) ? center : DEFAULT_CENTER;

  return (
    <div className="h-64 rounded-xl overflow-hidden border border-slate-700">
      <MapContainer center={safeCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <RecenterMap center={safeCenter} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Our own bookable demo hospitals/clinics */}
        {bookable.map((h) => (
          <Marker
            key={h.id}
            position={[Number(h.latitude), Number(h.longitude)]}
            icon={bookableIcon}
            eventHandlers={{ click: () => onSelect(h) }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <strong>{h.name}</strong>
              <br />
              {h.type === "clinic" ? "Clinic" : "Hospital"} — bookable
              <br />
              {h.address || ""}
            </Tooltip>
          </Marker>
        ))}

        {/* Real-world search results -- informational only, not bookable yet */}
        {results.map((r, i) => (
          <Marker key={`search-${i}`} position={[Number(r.lat), Number(r.lon)]} icon={infoIcon}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <strong>{(r.display_name || "").split(",")[0]}</strong>
              <br />
              <span style={{ color: "#64748b", fontSize: 12 }}>{r.display_name || ""}</span>
              <br />
              <em>Not yet connected with Nexora</em>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
