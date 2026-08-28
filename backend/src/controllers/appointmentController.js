const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");

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

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// POST /api/appointments/book
async function bookAppointment(req, res) {
  try {
    const { doctor_id, hospital_id, appointment_date, appointment_time, notes } = req.body;

    if (!doctor_id || !hospital_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "Doctor, hospital, date, and time are required." });
    }

    const existing = await Appointment.findOne({
      where: { doctor_id, appointment_date, appointment_time, status: "confirmed" },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "That time slot is already booked. Please choose another." });
    }

    const appointment = await Appointment.create({
      patient_id: req.user.id,
      doctor_id,
      hospital_id,
      appointment_date,
      appointment_time,
      notes,
      status: "confirmed",
    });

    return res.status(201).json({ appointment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not book appointment." });
  }
}

// GET /api/appointments/me
async function getMyAppointments(req, res) {
  try {
    const appointments = await Appointment.findAll({
      where: { patient_id: req.user.id, status: "confirmed" },
      include: [
        { model: DoctorProfile, as: "doctor" },
        { model: Hospital, as: "hospital" },
      ],
      order: [
        ["appointment_date", "ASC"],
        ["appointment_time", "ASC"],
      ],
    });
    return res.json({ appointments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch appointments." });
  }
}

// DELETE /api/appointments/:id  (cancel)
async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Not found." });
    if (appointment.patient_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }
    appointment.status = "cancelled";
    await appointment.save();
    return res.json({ message: "Cancelled." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not cancel appointment." });
  }
}

// GET /api/appointments/doctor/queue   (doctor)
// Today's appointments owned by the logged-in doctor User, time-ordered, with
// just enough patient context for the dashboard queue + record/message actions.
async function getDoctorQueue(req, res) {
  try {
    const appointments = await Appointment.findAll({
      where: { doctor_user_id: req.user.id, appointment_date: todayISO() },
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["id", "name"],
          include: [
            {
              model: PatientProfile,
              as: "profile",
              attributes: ["date_of_birth", "sex"],
            },
          ],
        },
      ],
      order: [["appointment_time", "ASC"]],
    });

    const queue = appointments.map((a) => ({
      id: a.id,
      time: a.appointment_time,
      status: a.status,
      chiefComplaint: a.chief_complaint || a.notes || null,
      patientId: a.patient?.id || null,
      patientName: a.patient?.name || "Unknown",
      patientAge: ageFromDob(a.patient?.profile?.date_of_birth),
      patientSex: a.patient?.profile?.sex || null,
    }));

    return res.json({ queue });
  } catch (err) {
    console.error("getDoctorQueue failed:", err);
    return res.status(500).json({ message: "Could not fetch the patient queue." });
  }
}

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorQueue,
};
