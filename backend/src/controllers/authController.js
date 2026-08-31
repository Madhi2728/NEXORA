const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../config/email");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    // Only allow patient/doctor self-registration.
    // Admin accounts should be created by an existing admin (see /api/auth/create-staff).
    const allowedSelfRoles = ["patient", "doctor"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "patient";

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role: finalRole });

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    user.last_login_at = new Date();
    await user.save();

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed." });
  }
}

// GET /api/auth/me  (requires verifyToken middleware)
async function getCurrentUser(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch user." });
  }
}

// POST /api/auth/create-staff  (admin only, protected by requireRole("admin") in routes)
async function createStaff(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const allowedRoles = ["admin", "doctor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role must be admin or doctor." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role });
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not create staff account." });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ where: { email } });

    // Always return a generic success message, whether or not the email
    // exists, so this endpoint can't be used to discover registered emails.
    const genericResponse = {
      message: "If an account with that email exists, a reset code has been sent.",
    };

    if (!user) return res.json(genericResponse);

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.reset_otp = otp;
    user.reset_otp_expires = expires;
    await user.save();

    await sendOtpEmail(user.email, otp);

    return res.json(genericResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not process request." });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.reset_otp || !user.reset_otp_expires) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    if (user.reset_otp !== otp || new Date() > new Date(user.reset_otp_expires)) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_otp = null;
    user.reset_otp_expires = null;
    await user.save();

    return res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not reset password." });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  createStaff,
  forgotPassword,
  resetPassword,
};
