// frontend/src/components/ReadingsTable.jsx
//
// Renders the readings list with a delete (bin) icon per row.
// Pass in `readings` and `onDelete` from the useVitals hook.

import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function ReadingsTable({ readings, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (reading) => {
    const label = `${reading.type} reading of ${reading.value}${reading.unit ? " " + reading.unit : ""} on ${new Date(
      reading.date
    ).toLocaleString()}`;

    const confirmed = window.confirm(`Delete ${label}? This can't be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(reading._id);
      await onDelete(reading._id);
    } catch (err) {
      alert(err.message || "Could not delete this reading. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!readings.length) {
    return <p className="text-slate-400 text-sm mt-4">No readings logged yet.</p>;
  }

  return (
    <table className="w-full text-sm mt-4">
      <thead>
        <tr className="text-left text-slate-400 border-b border-slate-700">
          <th className="py-2 pr-4">Type</th>
          <th className="py-2 pr-4">Value</th>
          <th className="py-2 pr-4">Date</th>
          <th className="py-2 pr-4 w-10"></th>
        </tr>
      </thead>
      <tbody>
        {readings.map((r) => (
          <tr key={r._id} className="border-b border-slate-800">
            <td className="py-2 pr-4 font-medium">{r.type}</td>
            <td className="py-2 pr-4">
              {r.value}
              {r.unit ? ` ${r.unit}` : ""}
            </td>
            <td className="py-2 pr-4 text-slate-400">
              {new Date(r.date).toLocaleString()}
            </td>
            <td className="py-2 pr-4">
              <button
                onClick={() => handleDelete(r)}
                disabled={deletingId === r._id}
                aria-label={`Delete ${r.type} reading from ${new Date(r.date).toLocaleDateString()}`}
                className="text-red-500 hover:text-red-400 disabled:opacity-40 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
