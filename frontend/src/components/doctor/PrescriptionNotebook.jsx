// frontend/src/components/doctor/PrescriptionNotebook.jsx
//
// Self-contained prescription "notebook" modal. A doctor picks it up from the
// dashboard Quick Actions to quickly write a prescription for the currently
// active patient (name + age/sex are auto-filled from queue data), then either
// saves it to the patient record or exports a clean PDF.
//
// Deliberately has NO dependency on the doctor dashboard beyond its props, so
// the same component can be dropped into admin / patient views later.
//
//   <PrescriptionNotebook
//     patient={{ name, age, sex }}     // auto-filled header, all optional
//     doctorName="Anitha Raman"
//     onClose={() => ...}
//     onSave={async (prescription) => ...}   // optional — see handleSave below
//   />
//
// Depends on jspdf + jspdf-autotable (already in package.json, used by
// utils/pdfGenerator.js and components/patient/PrescriptionPdfExport.jsx).

import { useState } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { NotebookPen, Plus, Trash2, Save, Download, X, Check } from "lucide-react";

const todayISO = () => new Date().toISOString().split("T")[0];

const emptyRow = () => ({
  id: crypto.randomUUID?.() ?? String(Math.random()).slice(2),
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
});

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PrescriptionNotebook({ patient, doctorName, onClose, onSave }) {
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([emptyRow()]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const patientName = patient?.name || "";
  const patientMeta = [patient?.age, patient?.sex].filter(Boolean).join(" · ");

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setSaved(false);
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(id) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  // Only rows where the doctor actually typed a drug name count.
  const medicines = rows
    .map((r) => ({
      name: r.name.trim(),
      dosage: r.dosage.trim(),
      frequency: r.frequency.trim(),
      duration: r.duration.trim(),
    }))
    .filter((r) => r.name);

  function buildPrescription() {
    return {
      patient_name: patientName,
      patient_age: patient?.age ?? null,
      patient_sex: patient?.sex ?? null,
      doctor_name: doctorName || null,
      prescribed_date: date,
      medicines,
      notes: notes.trim(),
      source: "written", // distinguishes this from OCR-uploaded prescriptions
    };
  }

  async function handleSave() {
    if (!patientName) {
      setError("No active patient selected.");
      return;
    }
    if (!medicines.length) {
      setError("Add at least one medicine (with a drug name) before saving.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      // TODO(backend): POST /api/prescriptions/written — no route exists yet.
      // Until then, the parent can persist however it likes via onSave; if no
      // handler is passed we just optimistically mark it saved so the flow is
      // demonstrable end-to-end.
      if (onSave) await onSave(buildPrescription());
      setSaved(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save prescription.");
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadPdf() {
    const doc = new jsPDF();

    // Header banner — mirrors PrescriptionPdfExport.jsx / pdfGenerator.js
    doc.setFillColor(109, 40, 217); // violet-700
    doc.rect(0, 0, 210, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Nexora Health — Prescription", 14, 17);

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    let y = 36;
    const row = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "—"), 48, y);
      y += 7;
    };
    row("Patient", patientMeta ? `${patientName} (${patientMeta})` : patientName);
    row("Doctor", doctorName ? `Dr. ${doctorName}` : "—");
    row("Date", formatDate(date));

    autoTable(doc, {
      startY: y + 4,
      head: [["#", "Medicine", "Dosage", "Frequency", "Duration"]],
      body: medicines.map((m, i) => [
        String(i + 1),
        m.name || "—",
        m.dosage || "—",
        m.frequency || "—",
        m.duration || "—",
      ]),
      headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 12, halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    let finalY = doc.lastAutoTable?.finalY || y + 20;
    if (notes.trim()) {
      finalY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Notes / Instructions", 14, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(notes.trim(), 182);
      doc.text(lines, 14, finalY + 6);
      finalY += 6 + lines.length * 4.6;
    }

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Generated with Nexora. Verify all dosages before dispensing.",
      14,
      finalY + 12
    );

    const safeName = (patientName || "patient").replace(/\s+/g, "-").toLowerCase();
    doc.save(`prescription-${safeName}-${date}.pdf`);
  }

  const inputCls =
    "w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:border-violet-500 [color-scheme:dark]";
  const labelCls = "text-xs text-slate-400 mb-1 block";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl">
        {/* Accent bar — same language as the dashboard SectionCards */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-teal-500" />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-900/40 text-violet-300">
              <NotebookPen size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100">Prescription Notebook</h2>
              <p className="text-xs text-slate-400">
                {patientName
                  ? `${patientName}${patientMeta ? ` · ${patientMeta}` : ""}`
                  : "No active patient"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-5">
          {/* Patient + date */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>Patient</label>
              <input
                value={patientName || ""}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-400"
              />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Medicine list */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">Medicines</label>
              <button
                onClick={addRow}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs text-teal-300 transition-colors hover:border-teal-500/50 hover:bg-slate-900"
              >
                <Plus size={13} /> Add row
              </button>
            </div>

            {/* Column headers (sm+) */}
            <div className="mb-1 hidden gap-2 px-1 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              {["Drug name", "Dosage", "Frequency", "Duration"].map((h) => (
                <span key={h} className="text-[11px] uppercase tracking-wide text-slate-500">
                  {h}
                </span>
              ))}
              <span className="w-7" />
            </div>

            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                >
                  <input
                    value={r.name}
                    onChange={(e) => updateRow(r.id, "name", e.target.value)}
                    placeholder="e.g. Amlodipine"
                    className={inputCls}
                  />
                  <input
                    value={r.dosage}
                    onChange={(e) => updateRow(r.id, "dosage", e.target.value)}
                    placeholder="5 mg"
                    className={inputCls}
                  />
                  <input
                    value={r.frequency}
                    onChange={(e) => updateRow(r.id, "frequency", e.target.value)}
                    placeholder="Once daily"
                    className={inputCls}
                  />
                  <input
                    value={r.duration}
                    onChange={(e) => updateRow(r.id, "duration", e.target.value)}
                    placeholder="30 days"
                    className={inputCls}
                  />
                  <button
                    onClick={() => removeRow(r.id)}
                    disabled={rows.length === 1}
                    className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg border border-slate-700 text-slate-500 transition-colors hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-500"
                    aria-label="Remove row"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes / Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Take after food. Review BP in 2 weeks. Avoid grapefruit juice."
              className={`${inputCls} resize-y`}
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>

        {/* Footer actions */}
        <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-slate-700 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 rounded-lg border border-teal-500/40 bg-teal-950/30 px-4 py-2 text-sm font-medium text-teal-300 transition-colors hover:bg-teal-950/60"
          >
            <Download size={15} /> Print / Download PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {saved ? (
              <>
                <Check size={15} /> Saved
              </>
            ) : (
              <>
                <Save size={15} /> {saving ? "Saving…" : "Save to record"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
