// frontend/src/components/patient/PrescriptionPdfExport.jsx
//
// Drop-in button that opens a small review form (patient/hospital/doctor +
// editable medicine lines seeded from OCR text), then generates a clean,
// colored, tabular PDF the user can download.
//
// Install first:
//   npm install jspdf jspdf-autotable

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, X } from "lucide-react";

// Turns raw OCR text into a starting guess at medicine lines — one per
// non-empty line. The user can edit/add/remove lines before exporting,
// since OCR on handwriting is often incomplete or wrong.
function seedLinesFromOcr(ocrText) {
  if (!ocrText) return [""];
  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : [""];
}

export default function PrescriptionPdfExport({ prescription, patientName }) {
  const [open, setOpen] = useState(false);
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [lines, setLines] = useState(() => seedLinesFromOcr(prescription.ocr_text));

  const dateStr = new Date(prescription.recorded_at || prescription.createdAt).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  function updateLine(i, value) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? value : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, ""]);
  }

  function removeLine(i) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function generatePdf() {
    const doc = new jsPDF();

    // Header banner
    doc.setFillColor(109, 40, 217); // violet-700
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Nexora Health — Prescription", 14, 18);

    // Patient / hospital / doctor / date block
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let y = 38;
    const row = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "—", 45, y);
      y += 7;
    };
    row("Patient Name", patientName);
    row("Hospital", hospital);
    row("Doctor", doctor);
    row("Date", dateStr);

    // Medicine table
    autoTable(doc, {
      startY: y + 4,
      head: [["#", "Medicine / Instruction"]],
      body: lines
        .filter((l) => l.trim())
        .map((l, i) => [String(i + 1), l]),
      headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 12, halign: "center" } },
    });

    const finalY = doc.lastAutoTable?.finalY || y + 20;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Auto-extracted and user-reviewed. Always confirm with your doctor or pharmacist.",
      14,
      finalY + 12
    );

    doc.save(`prescription-${dateStr.replace(/\s/g, "-")}.pdf`);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Download as PDF"
        className="text-violet-400 hover:text-violet-300 transition"
      >
        <Download size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
              <h3 className="font-bold text-slate-100">Review before download</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="text-xs text-slate-400">Patient Name</label>
                <input
                  value={patientName}
                  disabled
                  className="w-full mt-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Hospital</label>
                <input
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Kaveri Multispecialty Hospital"
                  className="w-full mt-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Doctor</label>
                <input
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder="e.g. Dr. Anitha Raman"
                  className="w-full mt-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Medicines / instructions</label>
                <div className="space-y-2 mt-1">
                  {lines.map((line, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={line}
                        onChange={(e) => updateLine(i, e.target.value)}
                        placeholder="e.g. Paracetamol 500mg — twice daily"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100"
                      />
                      <button
                        onClick={() => removeLine(i)}
                        className="text-red-400 hover:text-red-300 px-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addLine}
                  className="text-xs text-violet-400 hover:text-violet-300 mt-2"
                >
                  + Add line
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 flex-shrink-0">
              <button
                onClick={generatePdf}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
