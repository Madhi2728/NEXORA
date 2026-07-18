const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

module.exports = { register, login, getCurrentUser, createStaff };
