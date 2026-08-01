import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function addHeader(doc, title, dateStr) {
  doc.setFontSize(16);
  doc.setTextColor(124, 58, 237); // violet
  doc.text("Nexora Health", 14, 18);
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 26);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr}`, 14, 32);
}

function addMedicinesTable(doc, medicines, startY) {
  if (!medicines || !medicines.length) return startY;
  autoTable(doc, {
    startY,
    head: [["Medicine", "Common Use"]],
    body: medicines.map((m) => [m.name, m.commonUse || "-"]),
    headStyles: { fillColor: [124, 58, 237] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });
  return doc.lastAutoTable.finalY + 8;
}

function addRawText(doc, label, text, startY) {
  if (!text) return startY;
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(label, 14, startY);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 14, startY + 6);
  return startY + 6 + lines.length * 4.2;
}

export function generatePrescriptionPdf(prescription) {
  const doc = new jsPDF();
  const dateStr = new Date(prescription.created_at).toLocaleString();
  addHeader(doc, "Prescription OCR Report", dateStr);

  let y = 42;
  if (prescription.detected_medicines?.length) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Medicines Detected", 14, y);
    y = addMedicinesTable(doc, prescription.detected_medicines, y + 4);
  }
  y = addRawText(doc, "Extracted Text", prescription.ocr_text, y);

  doc.save(`prescription-${new Date(prescription.created_at).toISOString().slice(0, 10)}.pdf`);
}

export function generateReportPdf(report) {
  const doc = new jsPDF();
  const dateStr = new Date(report.created_at).toLocaleString();
  addHeader(doc, "Medical Report Analysis", dateStr);

  let y = 42;

  if (report.findings?.length) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Findings", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Test", "Value", "Normal Range", "Status"]],
      body: report.findings.map((f) => [
        f.test,
        `${f.value} ${f.unit}`,
        f.normalRange,
        f.status,
      ]),
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (report.detected_medicines?.length) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Medicines Mentioned", 14, y);
    y = addMedicinesTable(doc, report.detected_medicines, y + 4);
  }

  y = addRawText(doc, "Extracted Text", report.ocr_text, y);

  doc.save(`medical-report-${new Date(report.created_at).toISOString().slice(0, 10)}.pdf`);
}
