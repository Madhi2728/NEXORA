// Transactional email bodies. Table-based layout with inline styles only —
// email clients strip <style> blocks and have no idea what Tailwind is.
// Each function returns { subject, html, text }.

const BRAND = "#0d9488"; // Nexora teal
const INK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const BG = "#f1f5f9";

function shell({ heading, intro, otp, ttlMinutes, closing }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BG};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="padding:24px 28px 8px 28px;">
                <span style="font-size:20px;font-weight:bold;letter-spacing:0.5px;color:${BRAND};">Nexora</span><span style="font-size:20px;font-weight:bold;color:${INK};"> Health</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0 28px;">
                <h1 style="margin:0 0 8px 0;font-size:20px;line-height:1.3;color:${INK};">${heading}</h1>
                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:${MUTED};">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border:2px solid ${BORDER};border-radius:10px;padding:18px 12px;background:${BG};">
                      <span style="font-size:34px;font-weight:bold;letter-spacing:10px;color:${INK};font-family:'Courier New',Courier,monospace;">${otp}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 0 28px;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">
                  This code expires in <strong style="color:${INK};">${ttlMinutes} minutes</strong>. ${closing}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 24px 28px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
                  If you didn't request this email, you can safely ignore it — no changes will be made to your account.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:11px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;">© Nexora Health</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function plaintext({ heading, intro, otp, ttlMinutes, closing }) {
  return [
    "Nexora Health",
    "",
    heading,
    "",
    intro,
    "",
    `Your code: ${otp}`,
    "",
    `This code expires in ${ttlMinutes} minutes. ${closing}`,
    "",
    "If you didn't request this email, you can safely ignore it.",
  ].join("\n");
}

function signupOtpEmail({ name, otp, ttlMinutes }) {
  const greeting = name ? `Hi ${name}, ` : "";
  const data = {
    heading: "Verify your email address",
    intro: `${greeting}use the code below to finish setting up your Nexora Health account. You won't be able to sign in until your email is verified.`,
    otp,
    ttlMinutes,
    closing: "Request a new one from the sign-up screen if it lapses.",
  };
  return {
    subject: "Your Nexora verification code",
    html: shell(data),
    text: plaintext(data),
  };
}

function passwordResetOtpEmail({ name, otp, ttlMinutes }) {
  const greeting = name ? `Hi ${name}, ` : "";
  const data = {
    heading: "Reset your password",
    intro: `${greeting}we received a request to reset the password on your Nexora Health account. Enter the code below to choose a new one.`,
    otp,
    ttlMinutes,
    closing: "Your current password stays active until you complete the reset.",
  };
  return {
    subject: "Your Nexora password reset code",
    html: shell(data),
    text: plaintext(data),
  };
}

module.exports = { signupOtpEmail, passwordResetOtpEmail };
