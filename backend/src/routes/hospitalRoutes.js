const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { listHospitals, listDoctorsForHospital } = require("../controllers/hospitalController");

router.get("/", verifyToken, listHospitals);
router.get("/:hospitalId/doctors", verifyToken, listDoctorsForHospital);

module.exports = router;
