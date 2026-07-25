const path = require("path");
const MedicalReport = require("../models/MedicalReport");
const { recognizeText } = require("../utils/ocrEngine");
const { extractFindings, detectMedicines } = require("../utils/reportAnalyzer");

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

    report.ocr_text = text.trim();
    report.findings = findings;
    report.detected_medicines = medicines;
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
  deleteReport,
};
