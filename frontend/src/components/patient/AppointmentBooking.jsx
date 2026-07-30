// frontend/src/components/patient/AppointmentBooking.jsx
//
// Self-contained demo: search hospitals, view them on an embedded Google Map
// (no API key needed — uses the free maps.google.com/embed endpoint),
// see each hospital's doctors and their available slots, and "book" one.
//
// DEMO DATA NOTE: the hospitals/doctors/timings below are placeholders for
// demonstration only — replace HOSPITALS with a real fetch from your backend
// once you have an appointments/hospitals table. Addresses are illustrative,
// not verified real listings.

import { useMemo, useState } from "react";
import { MapPin, Clock, Stethoscope, CalendarCheck, Search, CheckCircle2 } from "lucide-react";

const HOSPITALS = [
  {
    id: "h1",
    name: "Kaveri Multispecialty Hospital",
    address: "Perundurai Road, Erode, Tamil Nadu",
    doctors: [
      {
        id: "d1",
        name: "Dr. Anitha Raman",
        specialty: "General Physician",
        slots: ["9:00 AM", "11:30 AM", "4:00 PM"],
      },
      {
        id: "d2",
        name: "Dr. Suresh Kumar",
        specialty: "Cardiologist",
        slots: ["10:00 AM", "2:30 PM"],
      },
    ],
  },
  {
    id: "h2",
    name: "Erode City Care Hospital",
    address: "Sathy Road, Erode, Tamil Nadu",
    doctors: [
      {
        id: "d3",
        name: "Dr. Priya Venkat",
        specialty: "Gynecologist",
        slots: ["9:30 AM", "1:00 PM", "5:00 PM"],
      },
      {
        id: "d4",
        name: "Dr. Mohan Das",
        specialty: "Orthopedic",
        slots: ["11:00 AM", "3:30 PM"],
      },
    ],
  },
  {
    id: "h3",
    name: "Green Valley General Hospital",
    address: "Brough Road, Erode, Tamil Nadu",
    doctors: [
      {
        id: "d5",
        name: "Dr. Kavitha Selvam",
        specialty: "Pediatrician",
        slots: ["10:30 AM", "12:00 PM", "4:30 PM"],
      },
      {
        id: "d6",
        name: "Dr. Arun Prakash",
        specialty: "Dermatologist",
        slots: ["9:00 AM", "2:00 PM"],
      },
    ],
  },
];

export default function AppointmentBooking() {
  const [query, setQuery] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState(HOSPITALS[0].id);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(null); // { hospital, doctor, slot }

  const filteredHospitals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HOSPITALS;
    return HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.doctors.some((d) => d.specialty.toLowerCase().includes(q))
    );
  }, [query]);

  const selectedHospital = HOSPITALS.find((h) => h.id === selectedHospitalId) || filteredHospitals[0];
  const selectedDoctor = selectedHospital?.doctors.find((d) => d.id === selectedDoctorId);

  function pickHospital(id) {
    setSelectedHospitalId(id);
    setSelectedDoctorId(null);
    setSelectedSlot(null);
    setConfirmed(null);
  }

  function pickDoctor(id) {
    setSelectedDoctorId(id);
    setSelectedSlot(null);
    setConfirmed(null);
  }

  function bookAppointment() {
    if (!selectedHospital || !selectedDoctor || !selectedSlot) return;
    // TODO: replace with a real POST /api/appointments call once the
    // backend supports it — this just confirms locally for the demo.
    setConfirmed({ hospital: selectedHospital, doctor: selectedDoctor, slot: selectedSlot });
  }

  const mapSrc = selectedHospital
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${selectedHospital.name}, ${selectedHospital.address}`
      )}&output=embed`
    : null;

  return (
    <div className="grid md:grid-cols-2 gap-5 h-full min-h-0">
      {/* Left: search + hospital list */}
      <div className="flex flex-col min-h-0">
        <div className="relative mb-3 flex-shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospital, area, or specialty..."
            className="w-full rounded-lg border border-slate-600 bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
          {filteredHospitals.length === 0 && (
            <p className="text-sm text-slate-500 text-center mt-6">No hospitals match that search.</p>
          )}
          {filteredHospitals.map((h) => (
            <button
              key={h.id}
              onClick={() => pickHospital(h.id)}
              className={`w-full text-left rounded-xl border p-3 transition ${
                h.id === selectedHospitalId
                  ? "border-teal-500 bg-teal-900/20"
                  : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
              }`}
            >
              <p className="font-medium text-slate-100 text-sm">{h.name}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {h.address}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {h.doctors.length} doctor{h.doctors.length > 1 ? "s" : ""} available
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: map + doctors + booking */}
      <div className="flex flex-col min-h-0">
        <div className="rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 h-40">
          {mapSrc && (
            <iframe
              title="hospital-map"
              src={mapSrc}
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mt-3 space-y-2 pr-1">
          {selectedHospital?.doctors.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border p-3 ${
                d.id === selectedDoctorId
                  ? "border-teal-500 bg-teal-900/20"
                  : "border-slate-700 bg-slate-900/40"
              }`}
            >
              <button onClick={() => pickDoctor(d.id)} className="w-full text-left">
                <p className="font-medium text-slate-100 text-sm flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-teal-400" /> {d.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{d.specialty}</p>
              </button>

              {d.id === selectedDoctorId && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        slot === selectedSlot
                          ? "bg-teal-600 border-teal-600 text-white"
                          : "border-slate-600 text-slate-300 hover:border-teal-500"
                      }`}
                    >
                      <Clock size={11} /> {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          disabled={!selectedDoctor || !selectedSlot}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium flex-shrink-0"
        >
          <CalendarCheck size={16} /> Book Appointment
        </button>

        {confirmed && (
          <div className="mt-2 flex items-start gap-2 text-sm text-teal-300 bg-teal-900/20 border border-teal-700 rounded-lg p-2.5 flex-shrink-0">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              Booked with <strong>{confirmed.doctor.name}</strong> at{" "}
              <strong>{confirmed.hospital.name}</strong> — {confirmed.slot}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
