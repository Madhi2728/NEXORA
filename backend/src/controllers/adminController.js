const { Op } = require("sequelize");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Message = require("../models/Message");
const ChatMessage = require("../models/ChatMessage");
const DoctorVerification = require("../models/DoctorVerification");
const AuditLog = require("../models/AuditLog");
const ChatEvent = require("../models/ChatEvent");

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

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

function parsePage(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize, 10) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
}

function emptyDaySeries(days) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  return out;
}

function bucketByDay(rawDates, days) {
  const series = emptyDaySeries(days);
  const idx = new Map(series.map((s, i) => [s.date, i]));
  for (const raw of rawDates) {
    if (!raw) continue;
    const key = new Date(raw).toISOString().slice(0, 10);
    if (idx.has(key)) series[idx.get(key)].count += 1;
  }
  return series;
}

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function medicationCount(rx) {
  const lists = [rx.written_medications, rx.structured_medications, rx.detected_medicines];
  for (const l of lists) if (Array.isArray(l) && l.length) return l.length;
  return 0;
}

// ---------------------------------------------------------------------------
// GET /api/admin/stats
// ---------------------------------------------------------------------------
async function getStats(req, res) {
  try {
    const [
      totalUsers,
      patients,
      doctors,
      admins,
      activeUsers,
      suspendedUsers,
      pendingVerifications,
      prescriptions,
      chatMessages,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: "patient" } }),
      User.count({ where: { role: "doctor" } }),
      User.count({ where: { role: "admin" } }),
      User.count({ where: { is_active: true } }),
      User.count({ where: { is_active: false } }),
      DoctorVerification.count({ where: { status: "pending" } }),
      Prescription.count(),
      ChatMessage.count({ where: { role: "user" } }),
    ]);

    const todayStr = new Date().toISOString().slice(0, 10);
    const appointmentsToday = await Appointment.count({
      where: { appointment_date: todayStr },
    });

    const since = daysAgo(29);

    const signupRows = await User.findAll({
      attributes: ["created_at"],
      where: { created_at: { [Op.gte]: since } },
      raw: true,
    });
    const apptRows = await Appointment.findAll({
      attributes: ["appointment_date"],
      where: { appointment_date: { [Op.gte]: since.toISOString().slice(0, 10) } },
      raw: true,
    });

    return res.json({
      kpis: {
        totalUsers,
        patients,
        doctors,
        admins,
        activeUsers,
        suspendedUsers,
        pendingVerifications,
        appointmentsToday,
        prescriptions,
        chatMessages,
      },
      signups: bucketByDay(signupRows.map((r) => r.created_at), 30),
      appointmentsPerDay: bucketByDay(apptRows.map((r) => r.appointment_date), 30),
      roleDistribution: [
        { role: "patient", count: patients },
        { role: "doctor", count: doctors },
        { role: "admin", count: admins },
      ],
    });
  } catch (err) {
    console.error("admin getStats failed:", err);
    return res.status(500).json({ message: "Could not load admin stats." });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/users?role=&search=&status=&page=&pageSize=
// ---------------------------------------------------------------------------
async function listUsers(req, res) {
  try {
    const { role, search, status } = req.query;
    const { page, pageSize, offset, limit } = parsePage(req.query);

    const where = {};
    if (role && ["admin", "doctor", "patient"].includes(role)) where.role = role;
    if (status === "active") where.is_active = true;
    if (status === "suspended") where.is_active = false;
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: like } },
        { email: { [Op.iLike]: like } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "is_active",
        "last_login_at",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    return res.json({ users: rows, total: count, page, pageSize });
  } catch (err) {
    console.error("admin listUsers failed:", err);
    return res.status(500).json({ message: "Could not load users." });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id/status   body { is_active }
// ---------------------------------------------------------------------------
async function setUserStatus(req, res) {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active (boolean) is required." });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own status." });
    }

    const previous = user.is_active;
    user.is_active = is_active;
    await user.save();

    await writeAudit(req, {
      action: is_active ? "user.activated" : "user.suspended",
      targetType: "user",
      targetId: user.id,
      metadata: { previous, next: is_active, email: user.email },
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("admin setUserStatus failed:", err);
    return res.status(500).json({ message: "Could not update user status." });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/users/:id   -> soft delete (is_active = false)
// A user is never hard-deleted; deactivation preserves their records.
// ---------------------------------------------------------------------------
async function softDeleteUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    user.is_active = false;
    await user.save();

    await writeAudit(req, {
      action: "user.soft_deleted",
      targetType: "user",
      targetId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return res.json({
      message: "User deactivated. Records retained.",
      user: { id: user.id, is_active: user.is_active },
    });
  } catch (err) {
    console.error("admin softDeleteUser failed:", err);
    return res.status(500).json({ message: "Could not deactivate user." });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/verifications?status=pending
// ---------------------------------------------------------------------------
async function listVerifications(req, res) {
  try {
    const status = req.query.status || "pending";
    const where = {};
    if (["pending", "approved", "rejected"].includes(status)) where.status = status;

    const verifications = await DoctorVerification.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "is_active"] },
        { model: User, as: "reviewer", attributes: ["id", "name"] },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.json({ verifications });
  } catch (err) {
    console.error("admin listVerifications failed:", err);
    return res.status(500).json({ message: "Could not load verifications." });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/verifications/:id   body { status, notes }
// ---------------------------------------------------------------------------
async function reviewVerification(req, res) {
  try {
    const { status, notes } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "status must be approved, rejected, or pending." });
    }

    const verification = await DoctorVerification.findByPk(req.params.id);
    if (!verification) return res.status(404).json({ message: "Verification not found." });

    verification.status = status;
    verification.notes = typeof notes === "string" ? notes : verification.notes;
    verification.reviewed_by = req.user.id;
    verification.reviewed_at = new Date();
    await verification.save();

    await writeAudit(req, {
      action: `verification.${status}`,
      targetType: "doctor_verification",
      targetId: verification.id,
      metadata: { userId: verification.user_id, notes: verification.notes || null },
    });

    const withUser = await DoctorVerification.findByPk(verification.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "is_active"] },
        { model: User, as: "reviewer", attributes: ["id", "name"] },
      ],
    });

    return res.json({ verification: withUser });
  } catch (err) {
    console.error("admin reviewVerification failed:", err);
    return res.status(500).json({ message: "Could not update verification." });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/appointments?from=&to=&doctorId=&status=&page=
// ---------------------------------------------------------------------------
async function listAppointments(req, res) {
  try {
    const { from, to, doctorId, status } = req.query;
    const { page, pageSize, offset, limit } = parsePage(req.query);

    const where = {};
    if (from) where.appointment_date = { ...(where.appointment_date || {}), [Op.gte]: from };
    if (to) where.appointment_date = { ...(where.appointment_date || {}), [Op.lte]: to };
    if (doctorId) where.doctor_user_id = doctorId;
    if (status) where.status = status;

    const { rows, count } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: User, as: "patient", attributes: ["id", "name", "email"] },
        { model: User, as: "doctorUser", attributes: ["id", "name"] },
        { model: require("../models/Hospital"), as: "hospital", attributes: ["id", "name"] },
      ],
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
      offset,
      limit,
    });

    const appointments = rows.map((a) => ({
      id: a.id,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status,
      chiefComplaint: a.chief_complaint,
      patientName: a.patient?.name || "—",
      doctorName: a.doctorUser?.name || "Unassigned",
      hospitalName: a.hospital?.name || "—",
    }));

    return res.json({ appointments, total: count, page, pageSize });
  } catch (err) {
    console.error("admin listAppointments failed:", err);
    return res.status(500).json({ message: "Could not load appointments." });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/prescriptions?source=ocr|written&from=&to=&page=
// ---------------------------------------------------------------------------
async function listPrescriptions(req, res) {
  try {
    const { source, from, to } = req.query;
    const { page, pageSize, offset, limit } = parsePage(req.query);

    const where = {};
    if (source === "ocr" || source === "written") where.source = source;
    if (from) where.created_at = { ...(where.created_at || {}), [Op.gte]: new Date(from) };
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.created_at = { ...(where.created_at || {}), [Op.lte]: end };
    }

    const { rows, count } = await Prescription.findAndCountAll({
      where,
      include: [{ model: User, as: "patient", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    const prescriptions = rows.map((rx) => ({
      id: rx.id,
      source: rx.source,
      status: rx.status,
      patientName: rx.patient?.name || rx.patient_name || "—",
      doctorName: rx.doctor_name || null,
      prescribedDate: rx.prescribed_date || rx.document_date || null,
      createdAt: rx.created_at,
      medicationCount: medicationCount(rx),
      hasFile: Boolean(rx.file_path),
    }));

    return res.json({ prescriptions, total: count, page, pageSize });
  } catch (err) {
    console.error("admin listPrescriptions failed:", err);
    return res.status(500).json({ message: "Could not load prescriptions." });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/chatbot-metrics
// ---------------------------------------------------------------------------
async function getChatbotMetrics(req, res) {
  try {
    const since = daysAgo(29);

    const events = await ChatEvent.findAll({
      where: { created_at: { [Op.gte]: since } },
      attributes: ["type", "provider", "created_at"],
      raw: true,
    });

    const totals = { messages: 0, rateLimited: 0, crisisFlags: 0, providerFallbacks: 0 };
    const providerCounts = {};
    for (const e of events) {
      if (e.type === "message") totals.messages += 1;
      else if (e.type === "rate_limited") totals.rateLimited += 1;
      else if (e.type === "crisis_flag") totals.crisisFlags += 1;
      else if (e.type === "provider_fallback") totals.providerFallbacks += 1;
      if (e.provider) providerCounts[e.provider] = (providerCounts[e.provider] || 0) + 1;
    }

    // Fall back to ChatMessage if ChatEvent telemetry hasn't accumulated yet,
    // so the volume chart isn't empty on an existing database.
    let volumeSource = events.filter((e) => e.type === "message").map((e) => e.created_at);
    if (volumeSource.length === 0) {
      const msgs = await ChatMessage.findAll({
        where: { role: "user", created_at: { [Op.gte]: since } },
        attributes: ["created_at"],
        raw: true,
      });
      volumeSource = msgs.map((m) => m.created_at);
      totals.messages = msgs.length;
    }

    const crisisEvents = await ChatEvent.findAll({
      where: { type: "crisis_flag" },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["created_at", "DESC"]],
      limit: 50,
    });

    return res.json({
      volume: bucketByDay(volumeSource, 30),
      totals,
      providerCounts,
      crisisEvents: crisisEvents.map((e) => ({
        id: e.id,
        userId: e.user_id,
        userName: e.user?.name || "Unknown",
        crisisType: e.metadata?.crisisType || "unspecified",
        createdAt: e.created_at,
      })),
    });
  } catch (err) {
    console.error("admin getChatbotMetrics failed:", err);
    return res.status(500).json({ message: "Could not load chatbot metrics." });
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/audit-logs?actorId=&action=&page=
// ---------------------------------------------------------------------------
async function listAuditLogs(req, res) {
  try {
    const { actorId, action } = req.query;
    const { page, pageSize, offset, limit } = parsePage(req.query);

    const where = {};
    if (actorId) where.actor_user_id = actorId;
    if (action && action.trim()) where.action = { [Op.iLike]: `%${action.trim()}%` };

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: "actor", attributes: ["id", "name", "email", "role"] }],
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    const logs = rows.map((l) => ({
      id: l.id,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      metadata: l.metadata || {},
      ipAddress: l.ip_address,
      createdAt: l.created_at,
      actorName: l.actor?.name || "System",
      actorEmail: l.actor?.email || null,
    }));

    return res.json({ logs, total: count, page, pageSize });
  } catch (err) {
    console.error("admin listAuditLogs failed:", err);
    return res.status(500).json({ message: "Could not load audit logs." });
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/announcements   body { audience, subject, body }
// Fans out one Message row per recipient so MessageInboxBell surfaces it.
// ---------------------------------------------------------------------------
async function sendAnnouncement(req, res) {
  try {
    const { audience, subject, body } = req.body;
    if (!["all", "doctors", "patients"].includes(audience)) {
      return res.status(400).json({ message: "audience must be all, doctors, or patients." });
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Message body is required." });
    }

    const where = { is_active: true };
    if (audience === "doctors") where.role = "doctor";
    else if (audience === "patients") where.role = "patient";
    else where.role = { [Op.in]: ["doctor", "patient"] };

    const recipients = await User.findAll({ where, attributes: ["id", "role"] });
    if (recipients.length === 0) {
      return res.status(200).json({ sent: 0, message: "No active recipients for that audience." });
    }

    const now = new Date();
    await Message.bulkCreate(
      recipients.map((u) => ({
        sender_id: req.user.id,
        sender_role: "admin",
        receiver_id: u.id,
        receiver_role: u.role,
        subject: subject && subject.trim() ? subject.trim() : "Announcement from Nexora",
        body: body.trim(),
        created_at: now,
      }))
    );

    await writeAudit(req, {
      action: "announcement.sent",
      targetType: "message",
      targetId: null,
      metadata: { audience, subject: subject || null, count: recipients.length },
    });

    return res.status(201).json({ sent: recipients.length });
  } catch (err) {
    console.error("admin sendAnnouncement failed:", err);
    return res.status(500).json({ message: "Could not send announcement." });
  }
}

module.exports = {
  getStats,
  listUsers,
  setUserStatus,
  softDeleteUser,
  listVerifications,
  reviewVerification,
  listAppointments,
  listPrescriptions,
  getChatbotMetrics,
  listAuditLogs,
  sendAnnouncement,
};
