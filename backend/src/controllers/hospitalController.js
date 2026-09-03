const Hospital = require("../models/Hospital");
const HospitalDoctor = require("../models/HospitalDoctor");
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");

// GET /api/hospitals  (PUBLIC — directory data only, no auth required)
// Returns active hospitals plus the doctor Users assigned to each via the
// admin-managed HospitalDoctor join. Keeps name/address/lat/long so the
// existing patient HospitalMap keeps working unchanged.
async function listHospitals(req, res) {
  try {
    const hospitals = await Hospital.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
      include: [
        {
          model: HospitalDoctor,
          as: "doctorLinks",
          include: [
            { model: User, as: "doctor", attributes: ["id", "name", "email"] },
          ],
        },
      ],
    });

    return res.json({
      hospitals: hospitals.map((h) => {
        const j = h.toJSON();
        const doctors = (j.doctorLinks || [])
          .filter((l) => l.doctor)
          .map((l) => ({
            id: l.doctor.id,
            name: l.doctor.name,
            department: l.department || null,
            fee: l.consultation_fee ?? null,
          }));
        delete j.doctorLinks;
        return { ...j, doctors };
      }),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch hospitals." });
  }
}

// GET /api/hospitals/:hospitalId/doctors  (legacy — DoctorProfile directory)
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
