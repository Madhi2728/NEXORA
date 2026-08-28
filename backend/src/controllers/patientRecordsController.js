const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const Hospital = require("../models/Hospital");
const Prescription = require("../models/Prescription");
const MedicalReport = require("../models/MedicalReport");

function ageFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

// Normalize a prescription row (OCR-uploaded or doctor-written) to one shape.
function normalizePrescription(p) {
  const isWritten = p.source === "written";
  const medications = isWritten
    ? p.written_medications || []
    : (p.structured_medications && p.structured_medications.length
        ? p.structured_medications
        : p.detected_medicines) || [];

  return {
    id: p.id,
    source: p.source || "ocr",
    prescribedDate: p.prescribed_date || p.document_date || p.created_at,
    doctorName: p.doctor_name || null,
    notes: p.notes || null,
    medications: medications.map((m) => ({
      name: m.name || "—",
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      duration: m.duration || "",
    })),
  };
}

// GET /api/patients/:id/records   (doctor | admin)
async function getPatientRecords(req, res) {
  try {
    const patientId = req.params.id;

    const patient = await User.findOne({
      where: { id: patientId, role: "patient" },
    });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const [profile, appointments, prescriptions, reports] = await Promise.all([
      PatientProfile.findOne({ where: { patient_id: patientId } }),
      Appointment.findAll({
        where: { patient_id: patientId },
        include: [
          { model: DoctorProfile, as: "doctor", attributes: ["name", "specialization"] },
          { model: Hospital, as: "hospital", attributes: ["name"] },
        ],
        order: [
          ["appointment_date", "DESC"],
          ["appointment_time", "DESC"],
        ],
      }),
      Prescription.findAll({
        where: { patient_id: patientId },
        order: [["created_at", "DESC"]],
      }),
      MedicalReport.findAll({
        where: { patient_id: patientId },
        order: [["created_at", "DESC"]],
      }),
    ]);

    const labResults = [];
    for (const r of reports) {
      const reportDate = r.document_date || r.created_at;
      for (const f of r.findings || []) {
        labResults.push({
          test: f.test || "—",
          value: f.value != null ? String(f.value) : "—",
          unit: f.unit || "",
          normalRange: f.normalRange || "",
          status: f.status || "unknown", // "normal" | "high" | "low" | "critical" | ...
          reportDate,
        });
      }
    }

    return res.json({
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: profile?.phone || null,
        sex: profile?.sex || null,
        age: ageFromDob(profile?.date_of_birth),
        dateOfBirth: profile?.date_of_birth || null,
        bloodGroup: profile?.blood_group || null,
        memberSince: patient.created_at,
      },
      allergies: profile?.allergies || [],
      chronicConditions: profile?.chronic_conditions || [],
      visitHistory: appointments.map((a) => ({
        id: a.id,
        date: a.appointment_date,
        time: a.appointment_time,
        status: a.status,
        chiefComplaint: a.chief_complaint || a.notes || null,
        notes: a.notes || null,
        doctorName: a.doctor?.name || null,
        hospitalName: a.hospital?.name || null,
      })),
      prescriptions: prescriptions.map(normalizePrescription),
      labResults,
    });
  } catch (err) {
    console.error("getPatientRecords failed:", err);
    return res.status(500).json({ message: "Could not load patient records." });
  }
}

module.exports = { getPatientRecords };
