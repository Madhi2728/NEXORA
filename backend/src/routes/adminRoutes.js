const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/requireAdmin");
const ctrl = require("../controllers/adminController");
const hospitals = require("../controllers/adminHospitalsController");
const system = require("../controllers/adminSystemController");
const reports = require("../controllers/adminReportsController");

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

// --- Hospitals & Departments ---
router.get("/hospitals", hospitals.listHospitals);
router.post("/hospitals", hospitals.createHospital);
router.patch("/hospitals/:id/status", hospitals.setHospitalStatus);
router.patch("/hospitals/:id", hospitals.updateHospital);
router.get("/hospitals/:id/doctors", hospitals.listHospitalDoctors);
router.post("/hospitals/:id/doctors", hospitals.addHospitalDoctor);
router.delete("/hospitals/:id/doctors/:userId", hospitals.removeHospitalDoctor);

// --- System Health ---
router.get("/system-health", system.getSystemHealth);

// --- Reports & Exports ---   (/history before /:type so it isn't matched as a type)
router.get("/reports/history", reports.getReportHistory);
router.get("/reports/:type", reports.getReport);

module.exports = router;
