const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const {
  generateAndSendOtp,
  verifyOtp,
  CooldownError,
  RateLimitError,
} = require("../services/otpService");
const { MailDeliveryError } = require("../services/mailer");
const { writeAudit } = require("../utils/adminAudit");

const BCRYPT_ROUNDS = 10;
const VALID_PURPOSES = ["signup_verification", "password_reset"];

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Password policy: >= 8 chars, at least one letter and one number.
// Returns an error string, or null if the password is acceptable.
function passwordPolicyError(password) {
  const pw = String(password || "");
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

// Turn an otpService.verifyOtp() failure into an HTTP response.
function respondOtpFailure(res, result) {
  if (result.reason === "too_many_attempts") {
    return res.status(429).json({
      message: "Too many incorrect attempts. Please request a new code.",
    });
  }
  return res.status(400).json({
    message: "That code is incorrect or has expired.",
    ...(result.attemptsRemaining != null
      ? { attemptsRemaining: result.attemptsRemaining }
      : {}),
  });
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, password, role } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    const pwError = passwordPolicyError(password);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    // Admins are provisioned via /api/auth/create-staff, not self-service.
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin accounts are created by an existing admin, not through sign-up.",
      });
    }
    const allowedSelfRoles = ["patient", "doctor"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "patient";

    const existing = await User.findOne({ where: { email } });

    if (existing && existing.is_email_verified) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    let user = existing;
    if (existing && !existing.is_email_verified) {
      // Abandoned signup — keep the row, just re-send a verification code.
      existing.name = name;
      existing.password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      existing.role = finalRole;
      await existing.save();
    } else {
      user = await User.create({
        name,
        email,
        password_hash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        role: finalRole,
        is_email_verified: false,
      });
    }

    try {
      await generateAndSendOtp({ email, name, purpose: "signup_verification" });
      await writeAudit(req, {
        action: "auth.signup_otp_sent",
        targetType: "user",
        targetId: user.id,
        metadata: { email, role: finalRole },
      });
    } catch (err) {
      if (err instanceof CooldownError) {
        // A code was already sent very recently — that's fine, tell the client.
        return res.status(201).json({ requiresVerification: true, email });
      }
      if (err instanceof MailDeliveryError) {
        console.error("register: could not send signup OTP:", err.message);
        return res
          .status(201)
          .json({ requiresVerification: true, email, emailDelivery: "failed" });
      }
      throw err;
    }

    return res.status(201).json({ requiresVerification: true, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed." });
  }
}

// POST /api/auth/verify-email  body { email, otp }
async function verifyEmail(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "That code is incorrect or has expired." });
    }
    if (user.is_email_verified) {
      // Already verified — just log them in.
      const token = signToken(user);
      return res.json({ token, user: publicUser(user) });
    }

    const result = await verifyOtp({ email, otp, purpose: "signup_verification" });
    if (!result.ok) return respondOtpFailure(res, result);

    user.is_email_verified = true;
    user.email_verified_at = new Date();
    user.last_login_at = new Date();
    await user.save();

    await writeAudit(req, {
      action: "auth.email_verified",
      targetType: "user",
      targetId: user.id,
      metadata: { email },
    });

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not verify email." });
  }
}

// POST /api/auth/resend-otp  body { email, purpose }
async function resendOtp(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const purpose = req.body.purpose;
    if (!email || !VALID_PURPOSES.includes(purpose)) {
      return res.status(400).json({ message: "A valid email and purpose are required." });
    }

    const user = await User.findOne({ where: { email } });

    // Don't leak which addresses exist / are already verified.
    const skip =
      !user ||
      (purpose === "signup_verification" && user.is_email_verified);
    if (skip) return res.json({ ok: true });

    const { expiresAt } = await generateAndSendOtp({
      email,
      name: user.name,
      purpose,
    });
    return res.json({ ok: true, expiresAt });
  } catch (err) {
    if (err instanceof CooldownError) {
      return res.status(429).json({
        message: err.message,
        secondsRemaining: err.secondsRemaining,
      });
    }
    if (err instanceof RateLimitError) {
      return res.status(429).json({ message: err.message });
    }
    if (err instanceof MailDeliveryError) {
      console.error("resendOtp: mail delivery failed:", err.message);
      return res.status(502).json({ message: "Could not send the code. Please try again shortly." });
    }
    console.error(err);
    return res.status(500).json({ message: "Could not send a new code." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.is_email_verified) {
      // Password was right — nudge them through verification with a fresh code.
      try {
        await generateAndSendOtp({
          email,
          name: user.name,
          purpose: "signup_verification",
        });
      } catch (err) {
        if (
          !(err instanceof CooldownError) &&
          !(err instanceof RateLimitError) &&
          !(err instanceof MailDeliveryError)
        ) {
          throw err;
        }
      }
      return res.status(403).json({ code: "EMAIL_NOT_VERIFIED", email });
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

// POST /api/auth/create-staff  (admin only, gated by requireRole in routes)
async function createStaff(req, res) {
  try {
    const { name, password, role } = req.body;
    const email = normalizeEmail(req.body.email);
    const allowedRoles = ["admin", "doctor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role must be admin or doctor." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Admin-vouched accounts are created already-verified.
    const user = await User.create({
      name,
      email,
      password_hash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role,
      is_email_verified: true,
      email_verified_at: new Date(),
    });
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not create staff account." });
  }
}

// POST /api/auth/forgot-password  body { email }
async function forgotPassword(req, res) {
  const genericResponse = {
    ok: true,
    message: "If an account with that email exists, a reset code has been sent.",
  };
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn(`forgot-password: no account for ${email} (responding generically).`);
      return res.json(genericResponse);
    }

    try {
      await generateAndSendOtp({ email, name: user.name, purpose: "password_reset" });
      await writeAudit(req, {
        action: "auth.password_reset_requested",
        targetType: "user",
        targetId: user.id,
        metadata: { email },
      });
    } catch (err) {
      // Never leak the failure reason — cooldown / rate-limit / delivery all
      // collapse to the same generic response.
      if (err instanceof MailDeliveryError) {
        console.error("forgot-password: mail delivery failed:", err.message);
      } else if (
        !(err instanceof CooldownError) &&
        !(err instanceof RateLimitError)
      ) {
        throw err;
      }
    }

    return res.json(genericResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not process request." });
  }
}

// POST /api/auth/reset-password  body { email, otp, newPassword }
async function resetPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required." });
    }
    const pwError = passwordPolicyError(newPassword);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    const result = await verifyOtp({ email, otp, purpose: "password_reset" });
    if (!result.ok) return respondOtpFailure(res, result);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "That code is incorrect or has expired." });
    }

    user.password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    // Clear the legacy on-user reset fields too, if they were ever set.
    user.reset_otp = null;
    user.reset_otp_expires = null;
    await user.save();

    // Any other outstanding codes for this address are now void.
    await OtpToken.update(
      { consumed_at: new Date() },
      { where: { email, consumed_at: null } }
    );

    await writeAudit(req, {
      action: "auth.password_reset_completed",
      targetType: "user",
      targetId: user.id,
      metadata: { email },
    });

    return res.json({ ok: true, message: "Password updated. Please sign in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not reset password." });
  }
}

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  getCurrentUser,
  createStaff,
  forgotPassword,
  resetPassword,
};
