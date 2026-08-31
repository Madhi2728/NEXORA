// Shared admin-report PDF builder. Same jsPDF + jspdf-autotable approach and
// colour scheme as components/patient/PrescriptionPdfExport.jsx (violet-700
// header banner [109,40,217], lavender alternate rows [245,243,255]).

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VIOLET = [109, 40, 217];
const LAVENDER = [245, 243, 255];

export function generateReportPdf({
  title,
  columns,
  rows,
  range,
  generatedAt,
}) {
  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
  });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(...VIOLET);
  doc.rect(0, 0, pageW, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`Nexora Health — ${title}`, 14, 16);

  doc.setTextColor(90, 90, 90);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const rangeStr =
    range && (range.from || range.to)
      ? `Range: ${range.from || "…"} to ${range.to || "…"}`
      : "Range: all time";
  doc.text(
    `${rangeStr}   ·   ${rows.length} rows   ·   Generated ${new Date(
      generatedAt || Date.now(),
    ).toLocaleString("en-IN")}`,
    14,
    31,
  );

  autoTable(doc, {
    startY: 36,
    head: [columns],
    body: rows,
    headStyles: { fillColor: VIOLET, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LAVENDER },
    styles: { fontSize: 8, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`nexora-${title.toLowerCase().replace(/\s+/g, "-")}-${stamp}.pdf`);
}

export function generateReportCsv({ title, columns, rows }) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    columns.map(esc).join(","),
    ...rows.map((r) => r.map(esc).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexora-${title.toLowerCase().replace(/\s+/g, "-")}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
