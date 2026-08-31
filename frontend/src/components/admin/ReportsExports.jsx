import { useState } from "react";
import { FileDown, FileText, Table2, Loader2, Download } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useReports } from "../../hooks/useAdmin";
import { StatePanel, formatDate } from "./shared";
import { generateReportPdf, generateReportCsv } from "../../utils/reportPdf";

const TYPES = [
  { id: "users", label: "Users" },
  { id: "appointments", label: "Appointments" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "doctor-activity", label: "Doctor activity" },
];

export default function ReportsExports() {
  const { data, loading, error, refetch, runReport } = useReports();
  const history = data?.history || [];

  const [type, setType] = useState("users");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState("pdf");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const typeLabel = TYPES.find((t) => t.id === type)?.label || type;

  async function generate() {
    setBusy(true);
    setErr("");
    setPreview(null);
    try {
      const result = await runReport(type, { from, to, format });
      setPreview(result);
      refetch(); // history now includes this export
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not build report.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!preview) return;
    const payload = {
      title: typeLabel,
      columns: preview.columns,
      rows: preview.rows,
      range: preview.range,
      generatedAt: preview.generatedAt,
    };
    if (format === "pdf") generateReportPdf(payload);
    else generateReportCsv(payload);
  }

  return (
    <div className="space-y-6">
      <SectionCard
        icon={FileDown}
        title="Reports & Exports"
        accent="from-teal-500 to-emerald-500"
        iconBg="bg-teal-900/40 text-teal-300"
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="text-xs text-slate-400">
            Report
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPreview(null);
              }}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-violet-500 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPreview(null);
              }}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 [color-scheme:dark] focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="text-xs text-slate-400">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPreview(null);
              }}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 [color-scheme:dark] focus:border-violet-500 focus:outline-none"
            />
          </label>
          <div className="text-xs text-slate-400">
            Format
            <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-600">
              {["pdf", "csv"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFormat(f);
                    setPreview(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1 px-3 py-2 text-sm ${
                    format === f
                      ? "bg-violet-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f === "pdf" ? (
                    <FileText className="h-3.5 w-3.5" />
                  ) : (
                    <Table2 className="h-3.5 w-3.5" />
                  )}
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {busy ? "Building…" : "Generate preview"}
          </button>
          {preview && (
            <>
              <span className="text-sm text-slate-400">
                {preview.rowCount} row{preview.rowCount === 1 ? "" : "s"}
              </span>
              <button
                onClick={download}
                disabled={preview.rowCount === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-teal-500/40 bg-teal-950/30 px-4 py-2 text-sm font-medium text-teal-300 hover:bg-teal-950/50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Download {format.toUpperCase()}
              </button>
            </>
          )}
          {err && <span className="text-sm text-rose-400">{err}</span>}
        </div>

        {preview && preview.rowCount > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900/60 text-left uppercase tracking-wider text-slate-500">
                  {preview.columns.map((c) => (
                    <th key={c} className="px-3 py-2 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 8).map((r, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    {r.map((cell, j) => (
                      <td key={j} className="px-3 py-1.5 text-slate-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rowCount > 8 && (
              <p className="px-3 py-2 text-[11px] text-slate-500">
                Showing 8 of {preview.rowCount} — the download contains all
                rows.
              </p>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={FileDown}
        title="Recent exports"
        accent="from-slate-500 to-slate-400"
        iconBg="bg-slate-700/60 text-slate-200"
        fullHeight
      >
        <StatePanel
          loading={loading}
          error={error}
          isEmpty={history.length === 0}
          emptyText="No exports yet."
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3 font-semibold">Report</th>
                <th className="pb-2 pr-3 font-semibold">Range</th>
                <th className="pb-2 pr-3 font-semibold">Rows</th>
                <th className="pb-2 pr-3 font-semibold">Format</th>
                <th className="pb-2 pr-3 font-semibold">By</th>
                <th className="pb-2 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t border-slate-800">
                  <td className="py-2 pr-3 capitalize text-slate-100">
                    {h.reportType.replace("-", " ")}
                  </td>
                  <td className="py-2 pr-3 text-xs text-slate-400">
                    {h.dateFrom || h.dateTo
                      ? `${h.dateFrom || "…"} → ${h.dateTo || "…"}`
                      : "all time"}
                  </td>
                  <td className="py-2 pr-3 text-slate-300">{h.rowCount}</td>
                  <td className="py-2 pr-3 uppercase text-slate-400">
                    {h.format || "—"}
                  </td>
                  <td className="py-2 pr-3 text-slate-400">{h.adminName}</td>
                  <td className="py-2 text-xs text-slate-400">
                    {formatDate(h.createdAt, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StatePanel>
      </SectionCard>
    </div>
  );
}
