const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Only build a real SMTP transporter if credentials are provided.
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends the OTP email. Falls back to logging the OTP to the server console
 * if no SMTP credentials are configured yet, so local dev keeps working
 * without needing a real mailbox.
 */
async function sendOtpEmail(toEmail, otp) {
  const t = getTransporter();

  if (!t) {
    console.log(`\n[DEV MODE - no SMTP configured] Password reset OTP for ${toEmail}: ${otp}\n`);
    return { devMode: true };
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your password reset code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
        <h2 style="color:#0d9488;">Reset your password</h2>
        <p>Use the code below to reset your Nexora Healthcare account password. It expires in 10 minutes.</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color:#0d9488;">${otp}</p>
        <p style="color:#64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { devMode: false };
}

module.exports = { sendOtpEmail };
