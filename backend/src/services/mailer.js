const { Resend } = require("resend");

// Transactional email via Resend (https://resend.com). Callers use
// sendMail({ to, subject, html, text }) — `to` must always be the
// recipient's OWN registered email address (the caller decides that, this
// module just delivers to whatever address it's given); it is never MAIL_FROM
// or any other address of this module's own choosing.
//
// If RESEND_API_KEY isn't set we log ONE warning and fall back to printing
// the email (OTP included, tagged [DEV OTP]) to the console so local dev
// keeps working — except under NODE_ENV=production, where a misconfigured
// mailer must fail loudly instead of silently dropping verification codes.

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

let _resend = null;
let _warnedMissingKey = false;

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function getClient() {
  if (_resend) return _resend;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Announce the active provider once at module load.
if (resendConfigured()) {
  console.log(`Mailer: Resend active (from ${FROM}).`);
} else if (process.env.NODE_ENV === "production") {
  console.error(
    "Mailer: RESEND_API_KEY is NOT set and NODE_ENV=production — email sends will fail."
  );
} else {
  console.warn(
    "Mailer: RESEND_API_KEY is not set. Emails (including OTP codes) will be printed to the console for local dev."
  );
  _warnedMissingKey = true;
}

function logToConsole({ to, subject, text, html }) {
  const body = (text || html || "").toString().trim();

  // Pull the 4-digit code out and print it on its own clearly-tagged line so
  // it's greppable and impossible to miss while developing without Resend.
  const codeMatch = body.match(/\b(\d{4})\b/);
  if (codeMatch) {
    console.log(`[DEV OTP] ${to} -> ${codeMatch[1]}  (${subject})`);
  }

  console.log(
    [
      "",
      "──────────── DEV EMAIL (RESEND_API_KEY not configured) ────────────",
      `To:      ${to}`,
      `From:    ${FROM}`,
      `Subject: ${subject}`,
      "",
      body,
      "─────────────────────────────────────────────────────────────────",
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

  if (!resendConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new MailDeliveryError(
        "RESEND_API_KEY is not configured; refusing to drop email in production."
      );
    }
    if (!_warnedMissingKey) {
      console.warn("Mailer: RESEND_API_KEY not configured — printing emails to console.");
      _warnedMissingKey = true;
    }
    logToConsole({ to, subject, text, html });
    return { delivered: false, provider: "console" };
  }

  try {
    // Never fall back to FROM as a recipient — `to` is always the caller-
    // supplied address (the user's own registered email).
    const { error } = await getClient().emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
      text,
    });
    if (error) {
      throw new Error(typeof error === "string" ? error : error.message || JSON.stringify(error));
    }
    return { delivered: true, provider: "resend" };
  } catch (err) {
    throw new MailDeliveryError(`Failed to send email via Resend: ${err.message}`, {
      cause: err,
    });
  }
}

module.exports = { sendMail, MailDeliveryError };
