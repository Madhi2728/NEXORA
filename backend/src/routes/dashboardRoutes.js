const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// These are placeholders proving RBAC works end-to-end.
// Real data will be filled in as each module (Health Dashboard, etc.) is built.

router.get("/admin", verifyToken, requireRole("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.id}`, role: req.user.role });
});

router.get("/doctor", verifyToken, requireRole("doctor"), (req, res) => {
  res.json({ message: `Welcome Doctor ${req.user.id}`, role: req.user.role });
});

router.get("/patient", verifyToken, requireRole("patient"), (req, res) => {
  res.json({ message: `Welcome Patient ${req.user.id}`, role: req.user.role });
});

module.exports = router;
