const nodemailer = require("nodemailer");

// Provider-agnostic transactional email. Callers use sendMail({ to, subject,
// html, text }) and never need to know whether SMTP or Resend is behind it.
//
// If the active provider isn't configured we log ONE warning and fall back to
// printing the email (OTP included) to the console so local dev keeps working
// — except under NODE_ENV=production, where a misconfigured mailer must fail
// loudly instead of silently dropping verification codes.

const PROVIDER = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();
const FROM_NAME = process.env.MAIL_FROM_NAME || "Nexora Health";
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || "no-reply@nexora.health";
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;

// Thrown for any delivery-layer failure so auth handlers can tell a bad
// address / provider outage apart from a validation error.
class MailDeliveryError extends Error {
  constructor(message, { cause } = {}) {
    super(message);
    this.name = "MailDeliveryError";
    if (cause) this.cause = cause;
  }
}

let _transporter = null;
let _warnedMissingCreds = false;

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function activeProviderConfigured() {
  return PROVIDER === "resend" ? resendConfigured() : smtpConfigured();
}

function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
}

// Announce the active provider once at module load.
if (activeProviderConfigured()) {
  console.log(`Mailer: provider "${PROVIDER}" active (from ${FROM}).`);
} else if (process.env.NODE_ENV === "production") {
  console.error(
    `Mailer: provider "${PROVIDER}" is NOT configured and NODE_ENV=production — email sends will fail.`
  );
} else {
  console.warn(
    `Mailer: provider "${PROVIDER}" is not configured. Emails (including OTP codes) will be printed to the console for local dev.`
  );
  _warnedMissingCreds = true;
}

function logToConsole({ to, subject, text, html }) {
  const body = (text || html || "").toString().trim();

  // Pull the 6-digit code out and print it on its own clearly-tagged line so
  // it's greppable and impossible to miss while developing without SMTP.
  const codeMatch = body.match(/\b(\d{6})\b/);
  if (codeMatch) {
    console.log(`[DEV OTP] ${to} -> ${codeMatch[1]}  (${subject})`);
  }

  console.log(
    [
      "",
      "──────────── DEV EMAIL (mailer not configured) ────────────",
      `To:      ${to}`,
      `From:    ${FROM}`,
      `Subject: ${subject}`,
      "",
      body,
      "──────────────────────────────────────────────────────────",
      "",
    ].join("\n")
  );
}

async function sendViaResend({ to, subject, html, text }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status}: ${body}`);
  }
}

async function sendViaSmtp({ to, subject, html, text }) {
  await getTransporter().sendMail({ from: FROM, to, subject, html, text });
}

/**
 * Send one transactional email.
 * @returns {Promise<{ delivered: boolean, provider: string }>}
 * @throws {MailDeliveryError} on any delivery failure
 */
async function sendMail({ to, subject, html, text }) {
  if (!to || !subject) {
    throw new MailDeliveryError("sendMail requires 'to' and 'subject'.");
  }

  if (!activeProviderConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new MailDeliveryError(
        `Mail provider "${PROVIDER}" is not configured; refusing to drop email in production.`
      );
    }
    if (!_warnedMissingCreds) {
      console.warn(`Mailer: "${PROVIDER}" not configured — printing emails to console.`);
      _warnedMissingCreds = true;
    }
    logToConsole({ to, subject, text, html });
    return { delivered: false, provider: "console" };
  }

  try {
    if (PROVIDER === "resend") {
      await sendViaResend({ to, subject, html, text });
    } else {
      await sendViaSmtp({ to, subject, html, text });
    }
    return { delivered: true, provider: PROVIDER };
  } catch (err) {
    throw new MailDeliveryError(`Failed to send email via ${PROVIDER}: ${err.message}`, {
      cause: err,
    });
  }
}

module.exports = { sendMail, MailDeliveryError };
