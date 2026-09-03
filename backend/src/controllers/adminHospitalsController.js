const { Op } = require("sequelize");
const Hospital = require("../models/Hospital");
const HospitalDoctor = require("../models/HospitalDoctor");
const User = require("../models/User");
const { writeAudit } = require("../utils/adminAudit");

function parsePage(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize, 10) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
}

const HOSPITAL_FIELDS = [
  "name",
  "type",
  "address",
  "city",
  "state",
  "pincode",
  "latitude",
  "longitude",
  "phone",
  "departments",
];

function pickHospitalFields(body) {
  const out = {};
  for (const f of HOSPITAL_FIELDS) {
    if (body[f] === undefined) continue;
    if (f === "latitude" || f === "longitude") {
      out[f] = body[f] === "" || body[f] === null ? null : Number(body[f]);
    } else if (f === "departments") {
      out[f] = Array.isArray(body[f])
        ? body[f].map((s) => String(s).trim()).filter(Boolean)
        : [];
    } else {
      out[f] = body[f];
    }
  }
  return out;
}

// GET /api/admin/hospitals?search=&city=&status=&page=&pageSize=
async function listHospitals(req, res) {
  try {
    const { search, city, status } = req.query;
    const { page, pageSize, offset, limit } = parsePage(req.query);

    const where = {};
    if (search && search.trim()) {
      where.name = { [Op.iLike]: `%${search.trim()}%` };
    }
    if (city && city.trim()) where.city = { [Op.iLike]: `%${city.trim()}%` };
    if (status === "active") where.is_active = true;
    if (status === "inactive") where.is_active = false;

    const { rows, count } = await Hospital.findAndCountAll({
      where,
      include: [{ model: HospitalDoctor, as: "doctorLinks", attributes: ["id"] }],
      order: [["name", "ASC"]],
      offset,
      limit,
      distinct: true,
    });

    const hospitals = rows.map((h) => {
      const j = h.toJSON();
      j.doctorCount = j.doctorLinks ? j.doctorLinks.length : 0;
      delete j.doctorLinks;
      return j;
    });

    return res.json({ hospitals, total: count, page, pageSize });
  } catch (err) {
    console.error("admin listHospitals failed:", err);
    return res.status(500).json({ message: "Could not load hospitals." });
  }
}

// POST /api/admin/hospitals
async function createHospital(req, res) {
  try {
    const fields = pickHospitalFields(req.body);
    if (!fields.name || !fields.name.trim()) {
      return res.status(400).json({ message: "Hospital name is required." });
    }
    const hospital = await Hospital.create({ ...fields, is_active: true });

    await writeAudit(req, {
      action: "hospital.created",
      targetType: "hospital",
      targetId: hospital.id,
      metadata: { name: hospital.name, city: hospital.city || null },
    });

    return res.status(201).json({ hospital });
  } catch (err) {
    console.error("admin createHospital failed:", err);
    return res.status(500).json({ message: "Could not create hospital." });
  }
}

// PATCH /api/admin/hospitals/:id
async function updateHospital(req, res) {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const fields = pickHospitalFields(req.body);
    await hospital.update(fields);

    await writeAudit(req, {
      action: "hospital.updated",
      targetType: "hospital",
      targetId: hospital.id,
      metadata: { fields: Object.keys(fields) },
    });

    return res.json({ hospital });
  } catch (err) {
    console.error("admin updateHospital failed:", err);
    return res.status(500).json({ message: "Could not update hospital." });
  }
}

// PATCH /api/admin/hospitals/:id/status   body { is_active }
async function setHospitalStatus(req, res) {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active (boolean) is required." });
    }
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    hospital.is_active = is_active;
    await hospital.save();

    await writeAudit(req, {
      action: is_active ? "hospital.activated" : "hospital.deactivated",
      targetType: "hospital",
      targetId: hospital.id,
      metadata: { name: hospital.name },
    });

    return res.json({ hospital });
  } catch (err) {
    console.error("admin setHospitalStatus failed:", err);
    return res.status(500).json({ message: "Could not update hospital status." });
  }
}

// GET /api/admin/hospitals/:id/doctors
async function listHospitalDoctors(req, res) {
  try {
    const links = await HospitalDoctor.findAll({
      where: { hospital_id: req.params.id },
      include: [{ model: User, as: "doctor", attributes: ["id", "name", "email", "role"] }],
      order: [["created_at", "ASC"]],
    });

    return res.json({
      doctors: links.map((l) => ({
        id: l.id,
        userId: l.user_id,
        name: l.doctor?.name || "Unknown",
        email: l.doctor?.email || null,
        department: l.department,
        fee: l.consultation_fee,
      })),
    });
  } catch (err) {
    console.error("admin listHospitalDoctors failed:", err);
    return res.status(500).json({ message: "Could not load hospital doctors." });
  }
}

// POST /api/admin/hospitals/:id/doctors   body { user_id, department, fee }
async function addHospitalDoctor(req, res) {
  try {
    const { user_id, department, fee } = req.body;
    if (!user_id) return res.status(400).json({ message: "user_id is required." });

    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const doctor = await User.findByPk(user_id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({ message: "That user is not a doctor." });
    }

    const [link, created] = await HospitalDoctor.findOrCreate({
      where: { hospital_id: hospital.id, user_id },
      defaults: {
        hospital_id: hospital.id,
        user_id,
        department: department || null,
        consultation_fee: fee === "" || fee == null ? null : parseInt(fee, 10),
      },
    });

    if (!created) {
      return res.status(409).json({ message: "That doctor is already assigned to this hospital." });
    }

    await writeAudit(req, {
      action: "hospital.doctor_added",
      targetType: "hospital",
      targetId: hospital.id,
      metadata: { userId: user_id, department: department || null, fee: link.consultation_fee },
    });

    return res.status(201).json({
      doctor: {
        id: link.id,
        userId: link.user_id,
        name: doctor.name,
        email: doctor.email,
        department: link.department,
        fee: link.consultation_fee,
      },
    });
  } catch (err) {
    console.error("admin addHospitalDoctor failed:", err);
    return res.status(500).json({ message: "Could not assign doctor." });
  }
}

// DELETE /api/admin/hospitals/:id/doctors/:userId
async function removeHospitalDoctor(req, res) {
  try {
    const removed = await HospitalDoctor.destroy({
      where: { hospital_id: req.params.id, user_id: req.params.userId },
    });
    if (!removed) return res.status(404).json({ message: "Assignment not found." });

    await writeAudit(req, {
      action: "hospital.doctor_removed",
      targetType: "hospital",
      targetId: req.params.id,
      metadata: { userId: req.params.userId },
    });

    return res.json({ message: "Doctor unassigned." });
  } catch (err) {
    console.error("admin removeHospitalDoctor failed:", err);
    return res.status(500).json({ message: "Could not unassign doctor." });
  }
}

module.exports = {
  listHospitals,
  createHospital,
  updateHospital,
  setHospitalStatus,
  listHospitalDoctors,
  addHospitalDoctor,
  removeHospitalDoctor,
};
