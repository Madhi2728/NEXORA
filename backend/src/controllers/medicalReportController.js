const path = require("path");
const MedicalReport = require("../models/MedicalReport");
const User = require("../models/User");
const { recognizeText } = require("../utils/ocrEngine");
const { extractFindings, detectMedicines } = require("../utils/reportAnalyzer");
const { structureDocument } = require("../utils/documentStructurer");

// POST /api/medical-reports  (patient only, multipart/form-data field "image")
async function uploadReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "An image file is required." });
    }

    const relativePath = path.join("medical-reports", req.file.filename);

    const report = await MedicalReport.create({
      patient_id: req.user.id,
      original_filename: req.file.originalname,
      file_path: relativePath,
      status: "processing",
    });

    res.status(201).json({ report });

    analyzeReport(report, req.file.path);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not upload report." });
  }
}

// Runs OCR + analysis in the background, then updates the DB row.
async function analyzeReport(report, absoluteFilePath) {
  try {
    const text = await recognizeText(absoluteFilePath);
    const findings = extractFindings(text);
    const medicines = detectMedicines(text);
    const structured = await structureDocument(text);

    report.ocr_text = text.trim();
    report.findings = findings;
    report.detected_medicines = medicines;
    report.patient_name = structured.patientName;
    report.doctor_name = structured.doctorName;
    report.facility_name = structured.facilityName;
    report.document_date = structured.documentDate;
    report.structured_medications = structured.medications;
    report.status = "done";
    await report.save();
  } catch (err) {
    console.error("Analysis failed for report", report.id, err);
    report.status = "failed";
    await report.save();
  }
}

// GET /api/medical-reports/me  (patient only)
async function getMyReports(req, res) {
  try {
    const reports = await MedicalReport.findAll({
      where: { patient_id: req.user.id },
      order: [["created_at", "DESC"]],
    });
    return res.json({ reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch reports." });
  }
}

// GET /api/medical-reports/:id  (owner, or doctor/admin)
async function getReportById(req, res) {
  try {
    const report = await MedicalReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: "Not found." });

    const isOwner = report.patient_id === req.user.id;
    const isStaff = ["doctor", "admin"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.json({ report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch report." });
  }
}

// GET /api/medical-reports/patient/:patientId  (doctor/admin)
async function getReportsForPatient(req, res) {
  try {
    const reports = await MedicalReport.findAll({
      where: { patient_id: req.params.patientId },
      order: [["created_at", "DESC"]],
    });
    return res.json({ reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch reports." });
  }
}

// GET /api/medical-reports/pending  (doctor/admin)
// Every report still awaiting review, newest first, with the patient's name.
async function getPendingReports(req, res) {
  try {
    const reports = await MedicalReport.findAll({
      where: { status: ["pending", "processing"] },
      include: [{ model: User, as: "patient", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
    });

    return res.json({
      reports: reports.map((r) => ({
        id: r.id,
        patientId: r.patient_id,
        patientName: r.patient?.name || r.patient_name || "Unknown",
        originalFilename: r.original_filename,
        documentDate: r.document_date,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error("getPendingReports failed:", err);
    return res.status(500).json({ message: "Could not fetch pending reports." });
  }
}

// GET /api/medical-reports/flagged  (doctor/admin)
// Flattens every non-normal finding across analyzed reports into one alert list,
// most severe first — feeds the dashboard's "Critical Alerts" card.
async function getFlaggedReports(req, res) {
  try {
    const RANK = { critical: 0, high: 1, low: 2 };

    const reports = await MedicalReport.findAll({
      where: { status: "done" },
      include: [{ model: User, as: "patient", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
      limit: 100,
    });

    const alerts = [];
    for (const r of reports) {
      for (const f of r.findings || []) {
        const flag = String(f.status || "").toLowerCase();
        if (!(flag in RANK)) continue;
        alerts.push({
          id: `${r.id}:${f.test}`,
          patientId: r.patient_id,
          patient: r.patient?.name || r.patient_name || "Unknown",
          metric: f.test || "—",
          value: [f.value, f.unit].filter(Boolean).join(" "),
          flag,
          reportDate: r.document_date || r.created_at,
        });
      }
    }
    alerts.sort((a, b) => RANK[a.flag] - RANK[b.flag]);

    return res.json({ alerts });
  } catch (err) {
    console.error("getFlaggedReports failed:", err);
    return res.status(500).json({ message: "Could not fetch flagged results." });
  }
}

// DELETE /api/medical-reports/:id  (owner or admin)
async function deleteReport(req, res) {
  try {
    const report = await MedicalReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: "Not found." });

    if (report.patient_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own records." });
    }

    await report.destroy();
    return res.json({ message: "Deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete report." });
  }
}

module.exports = {
  uploadReport,
  getMyReports,
  getReportById,
  getReportsForPatient,
  getPendingReports,
  getFlaggedReports,
  deleteReport,
};
