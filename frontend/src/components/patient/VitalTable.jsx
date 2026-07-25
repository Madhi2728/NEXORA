import { unitFor } from "../../utils/vitalTypes";

export default function VitalTable({ vitals, onDelete }) {
  if (!vitals.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Date</th>
            <th className="text-left px-4 py-2 font-medium">Value</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {vitals.slice(0, 10).map((v) => (
            <tr key={v.id} className="border-t border-slate-100">
              <td className="px-4 py-2 text-slate-600">
                {new Date(v.recorded_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-slate-800 font-medium">
                {v.value} {unitFor(v.type)}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onDelete(v.id)}
                  className="text-xs text-red-500 hover:text-red-700"
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
