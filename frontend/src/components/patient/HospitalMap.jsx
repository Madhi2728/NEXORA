import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function HospitalMap({ hospitals, onSelect, center }) {
  return (
    <div className="h-64 rounded-xl overflow-hidden border border-slate-700">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
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
