const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { upload } = require("../config/upload");
const {
  uploadPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  getPrescriptionsForPatient,
  deletePrescription,
} = require("../controllers/prescriptionController");

router.post(
  "/",
  verifyToken,
  requireRole("patient"),
  upload.single("image"),
  uploadPrescription
);

router.get("/me", verifyToken, requireRole("patient"), getMyPrescriptions);
router.get("/:id", verifyToken, getPrescriptionById);
router.delete("/:id", verifyToken, requireRole("patient", "admin"), deletePrescription);

router.get(
  "/patient/:patientId",
  verifyToken,
  requireRole("doctor", "admin"),
  getPrescriptionsForPatient
);

module.exports = router;
