const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getPatientRecords } = require("../controllers/patientRecordsController");

// Full clinical record for one patient — demographics, visit history,
// prescriptions, lab results, allergies/conditions — assembled from the
// existing Sequelize models. Doctor / admin only.
router.get(
  "/:id/records",
  verifyToken,
  requireRole("doctor", "admin"),
  getPatientRecords
);

module.exports = router;
