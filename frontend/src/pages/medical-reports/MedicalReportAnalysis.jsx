import { useCallback, useEffect, useRef, useState } from "react";
import { uploadReport, getMyReports, deleteReport } from "../../services/medicalReportService";
import { prescriptionImageUrl } from "../../utils/fileUrl";
import PrescriptionUpload from "../../components/patient/PrescriptionUpload";
import ReportFindings from "../../components/patient/ReportFindings";
import MedicineCard from "../../components/patient/MedicineCard";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    processing: { label: "Analyzing...", cls: "bg-amber-50 text-amber-700", spin: true },
    done: { label: "Done", cls: "bg-emerald-50 text-emerald-700", spin: false },
    failed: { label: "Failed", cls: "bg-red-50 text-red-700", spin: false },
    pending: { label: "Pending", cls: "bg-slate-100 text-slate-600", spin: true },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>
      {s.spin ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle size={12} />}
      {s.label}
    </span>
  );
}

export default function MedicalReportAnalysis() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const hasPending = reports.some((r) => r.status === "processing" || r.status === "pending");
    if (hasPending) pollRef.current = setInterval(load, 3000);
    return () => clearInterval(pollRef.current);
  }, [reports, load]);

  async function handleUpload(file) {
    await uploadReport(file);
    load();
  }

  async function handleDelete(id) {
    await deleteReport(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-slate-500 text-center">
              Loading...
            </div>
          ) : !reports.length ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-slate-500 text-center">
              No reports uploaded yet.
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <div className="flex gap-4">
                  <img
                    src={prescriptionImageUrl(r.file_path)}
                    alt="Report"
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                        <StatusBadge status={r.status} />
                      </div>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-400 hover:text-red-500"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {r.status === "done" && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        Findings
                      </h3>
                      <ReportFindings findings={r.findings} />
                    </div>

                    {r.detected_medicines?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">
                          Medicines mentioned
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {r.detected_medicines.map((m) => (
                            <MedicineCard key={m.name} medicine={m} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {r.status === "failed" && (
                  <p className="text-sm text-red-500">
                    Could not analyze this image. Try a clearer photo.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div>
          <PrescriptionUpload onUploaded={handleUpload} />
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Findings and medicine detection are automated and for informational purposes only —
        always confirm with your doctor or pharmacist.
      </p>
    </div>
  );
}
