const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  createStaff,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Admin-only: create doctor/admin accounts
router.post("/create-staff", verifyToken, requireRole("admin"), createStaff);

module.exports = router;
