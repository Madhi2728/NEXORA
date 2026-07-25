const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
  addVital,
  getMyVitals,
  getVitalsForPatient,
  deleteVital,
} = require("../controllers/vitalsController");

// Patient logs and views their own vitals
router.post("/", verifyToken, requireRole("patient"), addVital);
router.get("/me", verifyToken, requireRole("patient"), getMyVitals);
router.delete("/:id", verifyToken, requireRole("patient", "admin"), deleteVital);

// Doctor/admin can view a specific patient's vitals
router.get(
  "/patient/:patientId",
  verifyToken,
  requireRole("doctor", "admin"),
  getVitalsForPatient
);

module.exports = router;
