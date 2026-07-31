import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { getMyAppointments } from "../../services/appointmentService";

const DISMISSED_KEY = "nexora_dismissed_reminders";

function loadDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function saveDismissed(set) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [dismissed, setDismissed] = useState(loadDismissed());

  useEffect(() => {
    getMyAppointments()
      .then(setAppointments)
      .catch(() => {});
  }, []);

  const visible = appointments.filter((a) => !dismissed.has(a.id));

  function dismiss(id) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  }

  function clearAll() {
    const next = new Set(dismissed);
    visible.forEach((a) => next.add(a.id));
    setDismissed(next);
    saveDismissed(next);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-300 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {visible.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-fuchsia-600 rounded-full text-[10px] flex items-center justify-center text-white">
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-300">Upcoming Appointments</p>
            {visible.length > 0 && (
              <button onClick={clearAll} className="text-[11px] text-slate-500 hover:text-red-400">
                Clear all
              </button>
            )}
          </div>
          {visible.length === 0 ? (
            <p className="text-xs text-slate-500">
              No upcoming reminders. Medicine reminders will also appear here once that module
              is built.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {visible.map((a) => (
                <div
                  key={a.id}
                  className="text-xs bg-slate-900/40 rounded-lg p-2 flex justify-between items-start gap-2"
                >
                  <div>
                    <p className="text-slate-100 font-medium">{a.doctor?.name}</p>
                    <p className="text-slate-400">{a.hospital?.name}</p>
                    <p className="text-violet-300">
                      {a.appointment_date} at {a.appointment_time}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(a.id)}
                    className="text-slate-500 hover:text-red-400 flex-shrink-0"
                    aria-label="Mute this reminder"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
