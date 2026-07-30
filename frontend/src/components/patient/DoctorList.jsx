export default function DoctorList({ doctors, onBook }) {
  if (!doctors.length) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">
        No doctors listed for this location yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {doctors.map((d) => (
        <div
          key={d.id}
          className="bg-slate-900/40 border border-slate-700 rounded-lg p-3 flex justify-between items-center gap-2"
        >
          <div>
            <p className="text-sm font-medium text-slate-100">{d.name}</p>
            <p className="text-xs text-slate-400">{d.specialization}</p>
            <p className="text-xs text-slate-500">
              {d.days_available.join(", ")} · {d.start_time}–{d.end_time}
            </p>
          </div>
          <button
            onClick={() => onBook(d)}
            className="text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 flex-shrink-0"
          >
            Book
          </button>
        </div>
      ))}
    </div>
  );
}
