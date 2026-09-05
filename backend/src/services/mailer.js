const nodemailer = require("nodemailer");

// Transactional email via SMTP (nodemailer) — Gmail with an App Password by
// default, but any SMTP provider (Mailtrap, SES SMTP, etc.) works the same
// way. Callers use sendMail({ to, subject, html, text }) — `to` must always
// be the recipient's OWN registered email address (the caller decides that,
// this module just delivers to whatever address it's given); it is never
// MAIL_FROM or any other address of this module's own choosing.
//
// If SMTP_HOST/SMTP_USER/SMTP_PASS aren't all set we log ONE warning and
// fall back to printing the email (OTP included, tagged [DEV OTP]) to the
// console so local dev keeps working — except under NODE_ENV=production,
// where a misconfigured mailer must fail loudly instead of silently
// dropping verification codes.

const FROM = process.env.MAIL_FROM || "Nexora Health <no-reply@nexora.health>";

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

function getTransporter() {
  if (_transporter) return _transporter;
  const port = Number(process.env.SMTP_PORT || 587);
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 (Gmail default) uses STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
}

// Announce the active provider once at module load.
if (smtpConfigured()) {
  console.log(`Mailer: SMTP active (${process.env.SMTP_HOST}, from ${FROM}).`);
} else if (process.env.NODE_ENV === "production") {
  console.error(
    "Mailer: SMTP is NOT configured (SMTP_HOST/SMTP_USER/SMTP_PASS) and NODE_ENV=production — email sends will fail."
  );
} else {
  console.warn(
    "Mailer: SMTP is not configured. Emails (including OTP codes) will be printed to the console for local dev."
  );
  _warnedMissingCreds = true;
}

function logToConsole({ to, subject, text, html }) {
  const body = (text || html || "").toString().trim();

  // Pull the 4-digit code out and print it on its own clearly-tagged line so
  // it's greppable and impossible to miss while developing without SMTP.
  const codeMatch = body.match(/\b(\d{4})\b/);
  if (codeMatch) {
    console.log(`[DEV OTP] ${to} -> ${codeMatch[1]}  (${subject})`);
  }

  console.log(
    [
      "",
      "──────────── DEV EMAIL (SMTP not configured) ────────────",
      `To:      ${to}`,
      `From:    ${FROM}`,
      `Subject: ${subject}`,
      "",
      body,
      "───────────────────────────────────────────────────────",
      "",
    ].join("\n")
  );
}

/**
 * Send one transactional email.
 * @param {{ to: string, subject: string, html: string, text: string }} args
 *   `to` must be the end user's own registered email address.
 * @returns {Promise<{ delivered: boolean, provider: string }>}
 * @throws {MailDeliveryError} on any delivery failure
 */
async function sendMail({ to, subject, html, text }) {
  if (!to || !subject) {
    throw new MailDeliveryError("sendMail requires 'to' and 'subject'.");
  }

  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new MailDeliveryError(
        "SMTP is not configured; refusing to drop email in production."
      );
    }
    if (!_warnedMissingCreds) {
      console.warn("Mailer: SMTP not configured — printing emails to console.");
      _warnedMissingCreds = true;
    }
    logToConsole({ to, subject, text, html });
    return { delivered: false, provider: "console" };
  }

  try {
    // Never fall back to FROM as a recipient — `to` is always the caller-
    // supplied address (the user's own registered email).
    await getTransporter().sendMail({ from: FROM, to, subject, html, text });
    return { delivered: true, provider: "smtp" };
  } catch (err) {
    throw new MailDeliveryError(`Failed to send email via SMTP: ${err.message}`, {
      cause: err,
    });
  }
}

module.exports = { sendMail, MailDeliveryError };
