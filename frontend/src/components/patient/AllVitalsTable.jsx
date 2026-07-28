import { labelFor, unitFor } from "../../utils/vitalTypes";

export default function AllVitalsTable({ vitals, onDelete }) {
  if (!vitals.length) return null;

  const sorted = [...vitals].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/40 text-slate-400">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Type</th>
            <th className="text-left px-4 py-2 font-medium">Value</th>
            <th className="text-left px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 15).map((v) => (
            <tr key={v.id} className="border-t border-slate-700">
              <td className="px-4 py-2 text-slate-300">{labelFor(v.type)}</td>
              <td className="px-4 py-2 text-slate-100 font-medium">
                {v.value} {unitFor(v.type)}
              </td>
              <td className="px-4 py-2 text-slate-400">
                {new Date(v.recorded_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onDelete(v.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
