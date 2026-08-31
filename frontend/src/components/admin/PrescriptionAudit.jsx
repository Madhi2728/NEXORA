import { useEffect, useMemo, useState } from "react";
import { Pill, FileDown, Loader2 } from "lucide-react";
import SectionCard from "../common/SectionCard";
import api from "../../services/api";
import { generatePrescriptionPdf } from "../../utils/pdfGenerator";
import { useAdminPrescriptions } from "../../hooks/useAdmin";
import {
  StatePanel,
  SourceBadge,
  StatusBadge,
  Pagination,
  formatDate,
  inputCls,
} from "./shared";

const PAGE_SIZE = 15;

export default function PrescriptionAudit() {
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => setPage(1), [source, from, to]);

  const params = useMemo(
    () => ({ source, from, to, page, pageSize: PAGE_SIZE }),
    [source, from, to, page],
  );
  const { data, loading, error } = useAdminPrescriptions(params);
  const rows = data?.prescriptions || [];

  // Reuse the app's existing PDF export (utils/pdfGenerator.js). It expects a
  // full prescription record, so fetch it first via the shared endpoint.
  async function exportPdf(id) {
    setDownloading(id);
    try {
      const { data: full } = await api.get(`/prescriptions/${id}`);
      const rx = full.prescription;
      generatePrescriptionPdf({
        ...rx,
        structured_medications: rx.structured_medications?.length
          ? rx.structured_medications
          : rx.written_medications || rx.detected_medicines || [],
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Could not generate PDF.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <SectionCard
      icon={Pill}
      title="Prescription Audit"
      accent="from-teal-500 to-emerald-500"
      iconBg="bg-teal-900/40 text-teal-300"
      fullHeight
    >
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-xs text-slate-400">
          Source
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`${inputCls} mt-1`}
          >
            <option value="">All sources</option>
            <option value="written">Doctor-written</option>
            <option value="ocr">OCR upload</option>
          </select>
        </label>
        <label className="text-xs text-slate-400">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="text-xs text-slate-400">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={rows.length === 0}
        emptyText="No prescriptions match this filter."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3 font-semibold">Patient</th>
                <th className="pb-2 pr-3 font-semibold">Source</th>
                <th className="pb-2 pr-3 font-semibold">Status</th>
                <th className="pb-2 pr-3 font-semibold">Meds</th>
                <th className="pb-2 pr-3 font-semibold">Date</th>
                <th className="pb-2 font-semibold text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((rx) => (
                <tr key={rx.id} className="border-t border-slate-800">
                  <td className="py-2.5 pr-3 text-slate-100">
                    {rx.patientName}
                  </td>
                  <td className="py-2.5 pr-3">
                    <SourceBadge source={rx.source} />
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge value={rx.status} />
                  </td>
                  <td className="py-2.5 pr-3 text-slate-300">
                    {rx.medicationCount}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-slate-400">
                    {formatDate(rx.prescribedDate || rx.createdAt)}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => exportPdf(rx.id)}
                      disabled={downloading === rx.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-teal-300 hover:border-teal-500/50 disabled:opacity-60"
                    >
                      {downloading === rx.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" />
                      )}
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={data?.page || 1}
          pageSize={data?.pageSize || PAGE_SIZE}
          total={data?.total || 0}
          onPage={setPage}
        />
      </StatePanel>
    </SectionCard>
  );
}
