const AuditLog = require("../models/AuditLog");

// Shared audit writer for admin controllers. Mirrors the inline helper in
// adminController.js — same shape, same best-effort semantics (a failed audit
// write must never fail the request).
async function writeAudit(req, { action, targetType = null, targetId = null, metadata = {} }) {
  try {
    await AuditLog.create({
      actor_user_id: req.user?.id || null,
      action,
      target_type: targetType,
      target_id: targetId != null ? String(targetId) : null,
      metadata,
      ip_address:
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        null,
    });
  } catch (err) {
    console.error("writeAudit failed:", err.message);
  }
}

module.exports = { writeAudit };
