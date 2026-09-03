const { Op, fn, col } = require("sequelize");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const ExportLog = require("../models/ExportLog");
const { writeAudit } = require("../utils/adminAudit");

const TYPES = ["users", "appointments", "prescriptions", "doctor-activity"];

function dateWindow(from, to) {
  const range = {};
  if (from) range[Op.gte] = new Date(`${from}T00:00:00.000Z`);
  if (to) range[Op.lte] = new Date(`${to}T23:59:59.999Z`);
  return Object.getOwnPropertySymbols(range).length ? range : null;
}

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
}

async function buildUsers(win) {
  const where = win ? { created_at: win } : {};
  const rows = await User.findAll({
    where,
    attributes: ["id", "name", "email", "role", "is_active", "created_at", "last_login_at"],
    order: [["created_at", "DESC"]],
    raw: true,
  });
  return {
    columns: ["Name", "Email", "Role", "Status", "Registered", "Last login"],
    rows: rows.map((u) => [
      u.name,
      u.email,
      u.role,
      u.is_active ? "active" : "suspended",
      fmtDate(u.created_at),
      u.last_login_at ? fmtDate(u.last_login_at) : "never",
    ]),
  };
}

async function buildAppointments(win) {
  const where = win ? { created_at: win } : {};
  const rows = await Appointment.findAll({
    where,
    include: [
      { model: User, as: "patient", attributes: ["name"] },
      { model: User, as: "doctorUser", attributes: ["name"] },
      { model: require("../models/Hospital"), as: "hospital", attributes: ["name"] },
    ],
    order: [["appointment_date", "DESC"]],
  });
  return {
    columns: ["Date", "Time", "Patient", "Doctor", "Hospital", "Status"],
    rows: rows.map((a) => [
      a.appointment_date,
      a.appointment_time,
      a.patient?.name || "—",
      a.doctorUser?.name || "Unassigned",
      a.hospital?.name || "—",
      a.status,
    ]),
  };
}

async function buildPrescriptions(win) {
  const where = win ? { created_at: win } : {};
  const rows = await Prescription.findAll({
    where,
    include: [{ model: User, as: "patient", attributes: ["name"] }],
    order: [["created_at", "DESC"]],
  });
  return {
    columns: ["Date", "Patient", "Doctor", "Source", "Status", "Medicines"],
    rows: rows.map((rx) => {
      const meds =
        (rx.written_medications && rx.written_medications.length) ||
        (rx.structured_medications && rx.structured_medications.length) ||
        (rx.detected_medicines && rx.detected_medicines.length) ||
        0;
      return [
        fmtDate(rx.prescribed_date || rx.created_at),
        rx.patient?.name || rx.patient_name || "—",
        rx.doctor_name || "—",
        rx.source,
        rx.status,
        String(meds),
      ];
    }),
  };
}

async function buildDoctorActivity(win) {
  const doctors = await User.findAll({
    where: { role: "doctor" },
    attributes: ["id", "name", "email", "is_active", "last_login_at"],
    raw: true,
  });

  const apptWhere = { doctor_user_id: { [Op.ne]: null } };
  const rxWhere = { doctor_user_id: { [Op.ne]: null }, source: "written" };
  if (win) {
    apptWhere.created_at = win;
    rxWhere.created_at = win;
  }

  const apptCounts = await Appointment.findAll({
    where: apptWhere,
    attributes: ["doctor_user_id", [fn("COUNT", col("id")), "n"]],
    group: ["doctor_user_id"],
    raw: true,
  });
  const rxCounts = await Prescription.findAll({
    where: rxWhere,
    attributes: ["doctor_user_id", [fn("COUNT", col("id")), "n"]],
    group: ["doctor_user_id"],
    raw: true,
  });

  const apptMap = Object.fromEntries(apptCounts.map((r) => [r.doctor_user_id, Number(r.n)]));
  const rxMap = Object.fromEntries(rxCounts.map((r) => [r.doctor_user_id, Number(r.n)]));

  return {
    columns: ["Doctor", "Email", "Status", "Appointments", "Prescriptions", "Last login"],
    rows: doctors.map((d) => [
      d.name,
      d.email,
      d.is_active ? "active" : "suspended",
      String(apptMap[d.id] || 0),
      String(rxMap[d.id] || 0),
      d.last_login_at ? fmtDate(d.last_login_at) : "never",
    ]),
  };
}

const BUILDERS = {
  users: buildUsers,
  appointments: buildAppointments,
  prescriptions: buildPrescriptions,
  "doctor-activity": buildDoctorActivity,
};

// GET /api/admin/reports/:type?from=&to=&format=
async function getReport(req, res) {
  try {
    const { type } = req.params;
    if (!TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${TYPES.join(", ")}` });
    }
    const { from, to, format } = req.query;
    const win = dateWindow(from, to);

    const { columns, rows } = await BUILDERS[type](win);

    await ExportLog.create({
      admin_user_id: req.user.id,
      report_type: type,
      format: format || null,
      date_from: from || null,
      date_to: to || null,
      row_count: rows.length,
    });
    await writeAudit(req, {
      action: "report.exported",
      targetType: "report",
      targetId: type,
      metadata: { format: format || null, from: from || null, to: to || null, rows: rows.length },
    });

    return res.json({
      type,
      columns,
      rows,
      rowCount: rows.length,
      generatedAt: new Date().toISOString(),
      range: { from: from || null, to: to || null },
    });
  } catch (err) {
    console.error("admin getReport failed:", err);
    return res.status(500).json({ message: "Could not build report." });
  }
}

// GET /api/admin/reports/history
async function getReportHistory(req, res) {
  try {
    const logs = await ExportLog.findAll({
      include: [{ model: User, as: "admin", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    return res.json({
      history: logs.map((l) => ({
        id: l.id,
        reportType: l.report_type,
        format: l.format,
        dateFrom: l.date_from,
        dateTo: l.date_to,
        rowCount: l.row_count,
        adminName: l.admin?.name || "—",
        createdAt: l.created_at,
      })),
    });
  } catch (err) {
    console.error("admin getReportHistory failed:", err);
    return res.status(500).json({ message: "Could not load export history." });
  }
}

module.exports = { getReport, getReportHistory };
