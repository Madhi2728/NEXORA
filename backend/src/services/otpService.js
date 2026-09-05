const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const OtpToken = require("../models/OtpToken");
const { sendMail } = require("./mailer");
const { signupOtpEmail, passwordResetOtpEmail } = require("./emailTemplates");

// --- tuning (env with sane defaults) ---------------------------------------
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 4);
const SIGNUP_TTL_MIN = Number(process.env.OTP_SIGNUP_TTL_MINUTES || 10);
const RESET_TTL_MIN = Number(process.env.OTP_RESET_TTL_MINUTES || 15);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const RESEND_COOLDOWN_S = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
const MAX_SENDS_PER_HOUR = Number(process.env.OTP_MAX_SENDS_PER_HOUR || 5);

const BCRYPT_ROUNDS = 10; // matches the rest of the app (authController)

const PURPOSES = {
  signup_verification: { ttlMinutes: SIGNUP_TTL_MIN, template: signupOtpEmail },
  password_reset: { ttlMinutes: RESET_TTL_MIN, template: passwordResetOtpEmail },
};

class CooldownError extends Error {
  constructor(secondsRemaining) {
    super(`Please wait ${secondsRemaining}s before requesting another code.`);
    this.name = "CooldownError";
    this.secondsRemaining = secondsRemaining;
  }
}

class RateLimitError extends Error {
  constructor() {
    super("Too many codes requested for this email. Try again later.");
    this.name = "RateLimitError";
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateCode(length) {
  // crypto.randomInt is uniform and unpredictable — never Math.random for
  // this. Lower bound excludes leading zeros so the code is always exactly
  // `length` digits (e.g. length 4 -> crypto.randomInt(1000, 10000)).
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return String(crypto.randomInt(min, max));
}

/**
 * Create a fresh OTP for (email, purpose), invalidate any prior ones, and
 * email it. Returns { expiresAt } — the plaintext code is NEVER returned.
 * @throws {CooldownError} if the last send was too recent
 * @throws {RateLimitError} if the hourly cap is hit
 * @throws {MailDeliveryError} if the email can't be delivered
 */
async function generateAndSendOtp({ email, name, purpose }) {
  const cfg = PURPOSES[purpose];
  if (!cfg) throw new Error(`Unknown OTP purpose: ${purpose}`);

  const addr = normalizeEmail(email);
  const now = Date.now();

  // Resend cooldown — based on the newest non-consumed code.
  const latest = await OtpToken.findOne({
    where: { email: addr, purpose, consumed_at: null },
    order: [["created_at", "DESC"]],
  });
  if (latest) {
    const ageMs = now - new Date(latest.created_at).getTime();
    if (ageMs < RESEND_COOLDOWN_S * 1000) {
      throw new CooldownError(Math.ceil((RESEND_COOLDOWN_S * 1000 - ageMs) / 1000));
    }
  }

  // Hourly cap — count everything created in the last hour, consumed or not.
  const sentLastHour = await OtpToken.count({
    where: {
      email: addr,
      purpose,
      created_at: { [Op.gte]: new Date(now - 60 * 60 * 1000) },
    },
  });
  if (sentLastHour >= MAX_SENDS_PER_HOUR) {
    throw new RateLimitError();
  }

  // One live code per (email, purpose): burn any outstanding ones.
  await OtpToken.update(
    { consumed_at: new Date() },
    { where: { email: addr, purpose, consumed_at: null } }
  );

  const code = generateCode(OTP_LENGTH);
  const otpHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(now + cfg.ttlMinutes * 60 * 1000);

  await OtpToken.create({
    email: addr,
    otp_hash: otpHash,
    purpose,
    expires_at: expiresAt,
    attempts: 0,
  });

  const { subject, html, text } = cfg.template({
    name,
    otp: code,
    ttlMinutes: cfg.ttlMinutes,
  });
  await sendMail({ to: addr, subject, html, text }); // rethrows MailDeliveryError

  return { expiresAt };
}

/**
 * Check a submitted code against the newest live OTP for (email, purpose).
 * @returns {Promise<{ ok: boolean, reason?: string, attemptsRemaining?: number }>}
 */
async function verifyOtp({ email, otp, purpose }) {
  const addr = normalizeEmail(email);
  const code = String(otp || "").trim();

  const row = await OtpToken.findOne({
    where: {
      email: addr,
      purpose,
      consumed_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [["created_at", "DESC"]],
  });

  if (!row) return { ok: false, reason: "invalid" };

  if (row.attempts >= MAX_ATTEMPTS) {
    row.consumed_at = new Date();
    await row.save();
    return { ok: false, reason: "too_many_attempts" };
  }

  const match = await bcrypt.compare(code, row.otp_hash);
  if (!match) {
    row.attempts += 1;
    await row.save();
    return {
      ok: false,
      reason: "invalid",
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - row.attempts),
    };
  }

  row.consumed_at = new Date();
  await row.save();
  return { ok: true };
}

/** Delete OTP rows that expired more than 24h ago. */
async function purgeExpiredOtps() {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const removed = await OtpToken.destroy({
      where: { expires_at: { [Op.lt]: cutoff } },
    });
    if (removed) console.log(`otpService: purged ${removed} expired OTP row(s).`);
    return removed;
  } catch (err) {
    console.warn("otpService.purgeExpiredOtps failed:", err.message);
    return 0;
  }
}

module.exports = {
  generateAndSendOtp,
  verifyOtp,
  purgeExpiredOtps,
  CooldownError,
  RateLimitError,
};
