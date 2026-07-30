import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getMyAppointments } from "../../services/appointmentService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getMyAppointments()
      .then(setAppointments)
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-300 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {appointments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-fuchsia-600 rounded-full text-[10px] flex items-center justify-center text-white">
            {appointments.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 p-3">
          <p className="text-xs font-semibold text-slate-300 mb-2">Upcoming Appointments</p>
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500">
              No upcoming appointments. Medicine reminders will also appear here once that
              module is built.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {appointments.map((a) => (
                <div key={a.id} className="text-xs bg-slate-900/40 rounded-lg p-2">
                  <p className="text-slate-100 font-medium">{a.doctor?.name}</p>
                  <p className="text-slate-400">{a.hospital?.name}</p>
                  <p className="text-violet-300">
                    {a.appointment_date} at {a.appointment_time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
