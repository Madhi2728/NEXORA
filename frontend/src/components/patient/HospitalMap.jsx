import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Leaflet's default marker icons don't resolve correctly under most bundlers,
// so point them at the CDN copies explicitly.
const hospitalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// MapContainer's `center` prop only sets the *initial* view -- this helper
// lets us programmatically pan/zoom the map whenever center/zoom change
// (e.g. after a place search or picking a hospital from the search list).
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function HospitalMap({ hospitals, onSelect, center, zoom = 13 }) {
  return (
    <div className="h-64 rounded-xl overflow-hidden border border-slate-700">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <RecenterMap center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {hospitals.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            icon={hospitalIcon}
            eventHandlers={{ click: () => onSelect(h) }}
          >
            <Popup>
              <strong>{h.name}</strong>
              <br />
              {h.type === "clinic" ? "Clinic" : "Hospital"}
              <br />
              {h.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
