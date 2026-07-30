const Hospital = require("../models/Hospital");
const DoctorProfile = require("../models/DoctorProfile");

// GET /api/hospitals
async function listHospitals(req, res) {
  try {
    const hospitals = await Hospital.findAll({ order: [["name", "ASC"]] });
    return res.json({ hospitals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch hospitals." });
  }
}

// GET /api/hospitals/:hospitalId/doctors
async function listDoctorsForHospital(req, res) {
  try {
    const doctors = await DoctorProfile.findAll({
      where: { hospital_id: req.params.hospitalId },
      order: [["name", "ASC"]],
    });
    return res.json({ doctors });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch doctors." });
  }
}

module.exports = { listHospitals, listDoctorsForHospital };
