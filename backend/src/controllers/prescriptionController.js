const path = require("path");
const Prescription = require("../models/Prescription");
const { recognizeText } = require("../utils/ocrEngine");
const { detectMedicines } = require("../utils/reportAnalyzer");

// POST /api/prescriptions  (patient only, multipart/form-data field "image")
async function uploadPrescription(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "An image file is required." });
    }

    const relativePath = path.join("prescriptions", req.file.filename);

    const prescription = await Prescription.create({
      patient_id: req.user.id,
      original_filename: req.file.originalname,
      file_path: relativePath,
      status: "processing",
    });

    res.status(201).json({ prescription });

    runOcr(prescription, req.file.path);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not upload prescription." });
  }
}

// Runs OCR + medicine detection in the background, then updates the DB row.
async function runOcr(prescription, absoluteFilePath) {
  try {
    const text = await recognizeText(absoluteFilePath);
    const medicines = detectMedicines(text);

    prescription.ocr_text = text.trim();
    prescription.detected_medicines = medicines;
    prescription.status = "done";
    await prescription.save();
  } catch (err) {
    console.error("OCR failed for prescription", prescription.id, err);
    prescription.status = "failed";
    await prescription.save();
  }
}

// GET /api/prescriptions/me  (patient only)
async function getMyPrescriptions(req, res) {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patient_id: req.user.id },
      order: [["created_at", "DESC"]],
    });
    return res.json({ prescriptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch prescriptions." });
  }
}

// GET /api/prescriptions/:id  (owner, or doctor/admin)
async function getPrescriptionById(req, res) {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Not found." });

    const isOwner = prescription.patient_id === req.user.id;
    const isStaff = ["doctor", "admin"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.json({ prescription });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch prescription." });
  }
}

// GET /api/prescriptions/patient/:patientId  (doctor/admin)
async function getPrescriptionsForPatient(req, res) {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patient_id: req.params.patientId },
      order: [["created_at", "DESC"]],
    });
    return res.json({ prescriptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch prescriptions." });
  }
}

// DELETE /api/prescriptions/:id  (owner or admin)
async function deletePrescription(req, res) {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Not found." });

    if (prescription.patient_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own records." });
    }

    await prescription.destroy();
    return res.json({ message: "Deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete prescription." });
  }
}

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getPrescriptionsForPatient,
  deletePrescription,
};
