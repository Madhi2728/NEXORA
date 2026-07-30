import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, X } from "lucide-react";

function generateSlots(start, end, durationMin = 30) {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += durationMin;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export default function BookAppointmentModal({ doctor, hospital, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const slots = generateSlots(doctor.start_time, doctor.end_time, doctor.slot_duration_minutes || 30);
  const today = new Date().toISOString().split("T")[0];

  async function handleConfirm() {
    if (!date || !time) {
      setError("Please pick a date and time.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm({
        doctor_id: doctor.id,
        hospital_id: hospital.id,
        appointment_date: date,
        appointment_time: time,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not book appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-800 rounded-xl p-5 w-full max-w-sm space-y-3 border border-slate-700">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-100">Book with {doctor.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          {hospital.name} — {doctor.specialization}
        </p>

        <div>
          <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
            <Calendar size={13} /> Date
          </label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-100 px-3 py-2 text-sm [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Time slot</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-100 px-3 py-2 text-sm"
          >
            <option value="">Select a time</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium"
        >
          {submitting ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>,
    document.body
  );
}