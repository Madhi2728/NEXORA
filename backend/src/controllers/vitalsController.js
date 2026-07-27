const Vital = require("../models/Vital");

const VALID_TYPES = [
  "blood_pressure",
  "heart_rate",
  "weight",
  "blood_sugar",
  "temperature",
  "spo2",
  "hemoglobin",
];

// POST /api/vitals  (patient only — logs their own reading)
async function addVital(req, res) {
  try {
    const { type, value, unit, recorded_at, notes } = req.body;

    if (!type || !value) {
      return res.status(400).json({ message: "type and value are required." });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    const vital = await Vital.create({
      patient_id: req.user.id,
      type,
      value: String(value),
      unit,
      recorded_at: recorded_at || new Date(),
      notes,
    });

    return res.status(201).json({ vital });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not save vital reading." });
  }
}

// GET /api/vitals/me  (patient only — their own history, optional ?type=)
async function getMyVitals(req, res) {
  try {
    const where = { patient_id: req.user.id };
    if (req.query.type) where.type = req.query.type;

    const vitals = await Vital.findAll({
      where,
      order: [["recorded_at", "DESC"]],
      limit: 200,
    });

    return res.json({ vitals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch vitals." });
  }
}

// GET /api/vitals/patient/:patientId  (doctor/admin — view a specific patient's history)
async function getVitalsForPatient(req, res) {
  try {
    const { patientId } = req.params;
    const where = { patient_id: patientId };
    if (req.query.type) where.type = req.query.type;

    const vitals = await Vital.findAll({
      where,
      order: [["recorded_at", "DESC"]],
      limit: 200,
    });

    return res.json({ vitals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch vitals." });
  }
}

// DELETE /api/vitals/:id  (patient can delete only their own entries)
async function deleteVital(req, res) {
  try {
    const vital = await Vital.findByPk(req.params.id);
    if (!vital) return res.status(404).json({ message: "Vital not found." });

    if (vital.patient_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own readings." });
    }

    await vital.destroy();
    return res.json({ message: "Deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete vital." });
  }
}

module.exports = { addVital, getMyVitals, getVitalsForPatient, deleteVital, VALID_TYPES };
