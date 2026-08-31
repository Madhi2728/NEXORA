const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/requireAdmin");
const ctrl = require("../controllers/adminController");

// Every admin route: authenticated + role === "admin".
router.use(verifyToken, requireAdmin);

router.get("/stats", ctrl.getStats);

router.get("/users", ctrl.listUsers);
router.patch("/users/:id/status", ctrl.setUserStatus);
router.delete("/users/:id", ctrl.softDeleteUser);

router.get("/verifications", ctrl.listVerifications);
router.patch("/verifications/:id", ctrl.reviewVerification);

router.get("/appointments", ctrl.listAppointments);
router.get("/prescriptions", ctrl.listPrescriptions);
router.get("/chatbot-metrics", ctrl.getChatbotMetrics);
router.get("/audit-logs", ctrl.listAuditLogs);

router.post("/announcements", ctrl.sendAnnouncement);

module.exports = router;
