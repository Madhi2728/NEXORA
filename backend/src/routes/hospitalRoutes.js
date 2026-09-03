const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { listHospitals, listDoctorsForHospital } = require("../controllers/hospitalController");

// Public directory — hospitals + assigned doctors, used by the booking flow.
router.get("/", listHospitals);
// Legacy DoctorProfile directory (map only), still auth-gated.
router.get("/:hospitalId/doctors", verifyToken, listDoctorsForHospital);

module.exports = router;
