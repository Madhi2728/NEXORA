import { useEffect, useState } from "react";
import {
  listHospitals,
  listDoctorsForHospital,
  bookAppointment,
} from "../../services/appointmentService";
import HospitalMap from "../../components/patient/HospitalMap";
import DoctorList from "../../components/patient/DoctorList";
import BookAppointmentModal from "../../components/patient/BookAppointmentModal";

const DEFAULT_CENTER = [11.341, 77.7172]; // Erode, Tamil Nadu

export default function AppointmentBooking() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listHospitals()
      .then(setHospitals)
      .catch(() => {});
  }, []);

  async function handleSelectHospital(h) {
    setSelectedHospital(h);
    setMessage("");
    try {
      const docs = await listDoctorsForHospital(h.id);
      setDoctors(docs);
    } catch {
      setDoctors([]);
    }
  }

  async function handleConfirmBooking(payload) {
    await bookAppointment(payload);
    setMessage("Appointment booked!");
  }

  return (
    <div className="space-y-3">
      <HospitalMap hospitals={hospitals} onSelect={handleSelectHospital} center={DEFAULT_CENTER} />

      {selectedHospital ? (
        <div>
          <p className="text-sm font-medium text-slate-100">{selectedHospital.name}</p>
          <p className="text-xs text-slate-400 mb-2">{selectedHospital.address}</p>
          <DoctorList doctors={doctors} onBook={setBookingDoctor} />
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-2">
          Click a marker on the map to see available doctors.
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
        Demo data — these hospitals/clinics and doctor schedules are for demonstration, not real
        bookable providers yet.
      </p>
    </div>
  );
}
