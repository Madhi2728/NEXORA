import { FileText, Loader2, AlertCircle, Trash2, Download } from "lucide-react";
import { prescriptionImageUrl } from "../../utils/fileUrl";
import { generatePrescriptionPdf } from "../../utils/pdfGenerator";

function StatusBadge({ status }) {
  const map = {
    processing: { label: "Processing...", cls: "bg-amber-900/40 text-amber-300", icon: Loader2, spin: true },
    done: { label: "Done", cls: "bg-emerald-900/40 text-emerald-300", icon: FileText, spin: false },
    failed: { label: "Failed", cls: "bg-red-900/40 text-red-300", icon: AlertCircle, spin: false },
    pending: { label: "Pending", cls: "bg-slate-700 text-slate-300", icon: Loader2, spin: true },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>
      <Icon size={12} className={s.spin ? "animate-spin" : ""} />
      {s.label}
    </span>
  );
}

export default function PrescriptionList({ prescriptions, onDelete }) {
  if (!prescriptions.length) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-sm p-6 text-sm text-slate-400 text-center">
        No prescriptions uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prescriptions.map((p) => (
        <div key={p.id} className="bg-slate-800 rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex gap-4">
            <img
              src={prescriptionImageUrl(p.file_path)}
              alt="Prescription"
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {new Date(p.created_at).toLocaleString()}
                  </p>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.status === "done" && (
                    <button
                      onClick={() => generatePrescriptionPdf(p)}
                      className="text-slate-400 hover:text-violet-300 flex items-center gap-1 text-xs"
                      aria-label="Download PDF"
                    >
                      <Download size={14} /> PDF
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-slate-400 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {p.status === "done" && (
                <p className="text-sm text-slate-300 mt-2 line-clamp-3 whitespace-pre-wrap">
                  {p.ocr_text || "No text detected."}
                </p>
              )}
              {p.status === "failed" && (
                <p className="text-sm text-red-400 mt-2">
                  Could not read this image. Try a clearer photo.
                </p>
              )}
            </div>
          </div>

          {p.status === "done" && p.detected_medicines?.length > 0 && (
            <div className="bg-slate-900/40 rounded-lg overflow-hidden border border-slate-700">
              <table className="w-full text-xs">
                <thead className="bg-slate-900/60 text-slate-400">
                  <tr>
                    <th className="text-left px-3 py-1.5 font-medium">Medicine</th>
                    <th className="text-left px-3 py-1.5 font-medium">Common Use</th>
                  </tr>
                </thead>
                <tbody>
                  {p.detected_medicines.map((m) => (
                    <tr key={m.name} className="border-t border-slate-700">
                      <td className="px-3 py-1.5 text-slate-200 font-medium">{m.name}</td>
                      <td className="px-3 py-1.5 text-slate-400">{m.commonUse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
