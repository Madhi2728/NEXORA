// HospitalMapMarkers.jsx
// Two options for rendering hospital markers on the Leaflet map.
// Pick the one that fits, delete the other, and rename the component if needed.

import { Marker, Tooltip, Popup } from 'react-leaflet';

/* ============================================================
   OPTION A — Tooltip on ALL pins (grey informational + demo bookable)
   Use this if you want every pin, real or demo, to show name +
   address on hover.
   ============================================================ */
export function MapMarkersOptionA({ hospitals, demoPins, greyIcon, demoIcon }) {
  return (
    <>
      {/* Grey informational pins from Overpass (real-world OSM data) */}
      {hospitals.map((h) => (
        <Marker key={`osm-${h.id}`} position={[h.lat, h.lon]} icon={greyIcon}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <strong>{h.name}</strong><br />
            {h.address}
            <br />
            <em style={{ fontSize: '11px', color: '#888' }}>Not bookable</em>
          </Tooltip>
        </Marker>
      ))}

      {/* Colored demo/bookable pins */}
      {demoPins.map((d) => (
        <Marker key={`demo-${d.id}`} position={[d.lat, d.lon]} icon={demoIcon}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <strong>{d.name}</strong><br />
            {d.address}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

/* ============================================================
   OPTION B — Tooltip only on demo/bookable pins.
   Grey pins stay silent on hover; clicking one just shows a
   small popup noting it's informational only.
   ============================================================ */
export function MapMarkersOptionB({ hospitals, demoPins, greyIcon, demoIcon }) {
  return (
    <>
      {/* Grey pins — no hover tooltip, click popup only */}
      {hospitals.map((h) => (
        <Marker key={`osm-${h.id}`} position={[h.lat, h.lon]} icon={greyIcon}>
          <Popup>
            <strong>{h.name}</strong><br />
            Informational only — not bookable in this demo.
          </Popup>
        </Marker>
      ))}

      {/* Colored demo/bookable pins — hover shows address immediately */}
      {demoPins.map((d) => (
        <Marker key={`demo-${d.id}`} position={[d.lat, d.lon]} icon={demoIcon}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <strong>{d.name}</strong><br />
            {d.address}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

/* ============================================================
   Usage example (parent component):

   import { MapMarkersOptionA } from './HospitalMapMarkers';

   <MapContainer center={[center.lat, center.lon]} zoom={13}>
     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
     <MapMarkersOptionA
       hospitals={hospitals}   // from Overpass API response
       demoPins={demoPins}     // your existing seeded demo hospitals
       greyIcon={greyIcon}     // your grey Leaflet icon
       demoIcon={demoIcon}     // your colored Leaflet icon
     />
   </MapContainer>
   ============================================================ */
