const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { reportUpload } = require("../config/upload");
const {
  uploadReport,
  getMyReports,
  getReportById,
  getReportsForPatient,
  deleteReport,
} = require("../controllers/medicalReportController");

router.post(
  "/",
  verifyToken,
  requireRole("patient"),
  reportUpload.single("image"),
  uploadReport
);

router.get("/me", verifyToken, requireRole("patient"), getMyReports);
router.get("/:id", verifyToken, getReportById);
router.delete("/:id", verifyToken, requireRole("patient", "admin"), deleteReport);

router.get(
  "/patient/:patientId",
  verifyToken,
  requireRole("doctor", "admin"),
  getReportsForPatient
);

module.exports = router;
