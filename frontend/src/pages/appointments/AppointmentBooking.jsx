import { useEffect, useState } from "react";
import {
  listHospitals,
  bookAppointment,
} from "../../services/appointmentService";
import HospitalMap from "../../components/patient/HospitalMap";
import HospitalSearchBar from "../../components/patient/HospitalSearchBar";
import DoctorList from "../../components/patient/DoctorList";
import BookAppointmentModal from "../../components/patient/BookAppointmentModal";

const DEFAULT_CENTER = [11.341, 77.7172]; // Erode, Tamil Nadu

export default function AppointmentBooking() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [message, setMessage] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    listHospitals()
      .then((hs) => setHospitals(Array.isArray(hs) ? hs : []))
      .catch(() => setHospitals([]));
  }, []);

  function handleSelectHospital(h) {
    setSelectedHospital(h);
    setMessage("");
    if (h.latitude != null && h.longitude != null) {
      setMapCenter([h.latitude, h.longitude]);
      setMapZoom(15);
    }
    // Doctors now come embedded on the hospital from the public directory
    // endpoint (admin-managed HospitalDoctor links).
    setDoctors(Array.isArray(h.doctors) ? h.doctors : []);
  }

  function handleSearchResults(results) {
    setSearchResults(results);
    setSelectedHospital(null);
    setDoctors([]);
    if (results.length) {
      setMapCenter([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
      setMapZoom(13);
    }
  }

  async function handleConfirmBooking(payload) {
    await bookAppointment(payload);
    setMessage("Appointment booked!");
  }

  return (
    <div className="space-y-3">
      <HospitalSearchBar
        hospitals={hospitals}
        onSelectHospital={handleSelectHospital}
        onSearchResults={handleSearchResults}
      />

      <HospitalMap
        hospitals={hospitals}
        searchResults={searchResults}
        onSelect={handleSelectHospital}
        center={mapCenter}
        zoom={mapZoom}
      />

      {searchResults.length > 0 && (
        <p className="text-xs text-slate-500">
          Grey pins are real places from OpenStreetMap search results, shown for
          reference — only the colored pins (our demo hospitals/clinics) are
          bookable right now.
        </p>
      )}

      {selectedHospital ? (
        <div>
          <p className="text-sm font-medium text-slate-100">
            {selectedHospital.name}
          </p>
          <p className="text-xs text-slate-400 mb-2">
            {selectedHospital.address || ""}
          </p>
          <DoctorList doctors={doctors} onBook={setBookingDoctor} />
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-2">
          Search or click a colored marker on the map to see available doctors.
        </p>
      )}

      {message && <p className="text-sm text-emerald-400">{message}</p>}

      {bookingDoctor && (
        <BookAppointmentModal
          doctor={bookingDoctor}
          hospital={selectedHospital}
          onClose={() => setBookingDoctor(null)}
          onConfirm={handleConfirmBooking}
        />
      )}

      <p className="text-xs text-slate-500">
        Demo data — our hospitals/clinics and doctor schedules are for
        demonstration, not real bookable providers yet.
      </p>
    </div>
  );
}
