const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorQueue,
} = require("../controllers/appointmentController");

router.post("/book", verifyToken, requireRole("patient"), bookAppointment);
router.get("/me", verifyToken, requireRole("patient"), getMyAppointments);
router.get("/doctor/queue", verifyToken, requireRole("doctor"), getDoctorQueue);
router.delete("/:id", verifyToken, requireRole("patient"), cancelAppointment);

module.exports = router;
