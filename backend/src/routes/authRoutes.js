const express = require("express");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOtp,
  login,
  getCurrentUser,
  createStaff,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Broad guard for every /api/auth/* route.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down and try again in a few minutes." },
});

// Tighter guard for the endpoints that trigger an email send.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many code requests. Please wait 15 minutes and try again." },
});

router.use(authLimiter);

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

// Admin-only: create doctor/admin accounts
router.post("/create-staff", verifyToken, requireRole("admin"), createStaff);

module.exports = router;
