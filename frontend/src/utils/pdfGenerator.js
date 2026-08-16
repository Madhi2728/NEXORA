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

function addPatientInfoBlock(doc, info, startY) {
  const { patientName, doctorName, facilityName, documentDate } = info || {};
  if (!patientName && !doctorName && !facilityName && !documentDate) return startY;

  const rows = [
    ["Patient", patientName || "-"],
    ["Doctor", doctorName || "-"],
    ["Facility", facilityName || "-"],
    ["Document Date", documentDate || "-"],
  ];

  autoTable(doc, {
    startY,
    body: rows,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [30, 41, 59], cellWidth: 35 },
      1: { textColor: [71, 85, 105] },
    },
    margin: { left: 14, right: 14 },
  });

  return doc.lastAutoTable.finalY + 6;
}

function addMedicationsTable(doc, medications, startY, accentColor) {
  if (!medications || !medications.length) return startY;

  // Prefer the new structured shape { name, dosage, frequency, route }.
  // Fall back to the legacy { name, commonUse } shape for older records
  // that were saved before structured extraction existed.
  const hasStructuredFields = medications.some(
    (m) => m.dosage != null || m.frequency != null || m.route != null
  );

  if (hasStructuredFields) {
    autoTable(doc, {
      startY,
      head: [["Medicine", "Dosage", "Frequency", "Route"]],
      body: medications.map((m) => [
        m.name || "-",
        m.dosage || "-",
        m.frequency || "-",
        m.route || "-",
      ]),
      headStyles: { fillColor: accentColor },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
  } else {
    autoTable(doc, {
      startY,
      head: [["Medicine", "Common Use"]],
      body: medications.map((m) => [m.name, m.commonUse || "-"]),
      headStyles: { fillColor: accentColor },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
  }

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

  y = addPatientInfoBlock(
    doc,
    {
      patientName: prescription.patient_name,
      doctorName: prescription.doctor_name,
      facilityName: prescription.facility_name,
      documentDate: prescription.document_date,
    },
    y
  );

  const medications =
    prescription.structured_medications?.length
      ? prescription.structured_medications
      : prescription.detected_medicines;

  if (medications?.length) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Medications", 14, y);
    y = addMedicationsTable(doc, medications, y + 4, [124, 58, 237]);
  }

  y = addRawText(doc, "Raw Extracted Text", prescription.ocr_text, y);

  doc.save(`prescription-${new Date(prescription.created_at).toISOString().slice(0, 10)}.pdf`);
}

export function generateReportPdf(report) {
  const doc = new jsPDF();
  const dateStr = new Date(report.created_at).toLocaleString();
  addHeader(doc, "Medical Report Analysis", dateStr);

  let y = 42;

  y = addPatientInfoBlock(
    doc,
    {
      patientName: report.patient_name,
      doctorName: report.doctor_name,
      facilityName: report.facility_name,
      documentDate: report.document_date,
    },
    y
  );

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

  const medications =
    report.structured_medications?.length
      ? report.structured_medications
      : report.detected_medicines;

  if (medications?.length) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Medications Mentioned", 14, y);
    y = addMedicationsTable(doc, medications, y + 4, [16, 185, 129]);
  }

  y = addRawText(doc, "Raw Extracted Text", report.ocr_text, y);

  doc.save(`medical-report-${new Date(report.created_at).toISOString().slice(0, 10)}.pdf`);
}