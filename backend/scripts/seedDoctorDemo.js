// Run manually with:  node scripts/seedDoctorDemo.js
//
// Seeds a self-contained demo for the doctor dashboard's "View Patient
// Records" + "Message Patient" features: one demo doctor login, five demo
// patients (with profiles, visit history, written prescriptions and lab
// reports), and today's appointment queue linking them to the doctor.
//
// Idempotent — safe to run repeatedly. Fictional people, not real patients.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("../src/config/db");
const User = require("../src/models/User");
const PatientProfile = require("../src/models/PatientProfile");
const Hospital = require("../src/models/Hospital");
const DoctorProfile = require("../src/models/DoctorProfile");
const Appointment = require("../src/models/Appointment");
const Prescription = require("../src/models/Prescription");
const MedicalReport = require("../src/models/MedicalReport");
const Message = require("../src/models/Message");

const PASSWORD = "demo1234";

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
const TODAY = isoDaysAgo(0);

const DOCTOR = { name: "Dr. Meera Nair", email: "dr.demo@nexora.health" };

const PATIENTS = [
  {
    name: "Ananya Raghavan",
    email: "ananya@nexora.health",
    profile: {
      date_of_birth: "1992-06-15",
      sex: "F",
      phone: "+91 98400 11223",
      blood_group: "O+",
      allergies: ["Penicillin"],
      chronic_conditions: ["Hypertension"],
    },
    queue: { time: "09:00", status: "done", chief_complaint: "Follow-up: hypertension" },
    pastVisits: [
      { date: isoDaysAgo(30), chief_complaint: "Routine BP check", status: "done" },
      { date: isoDaysAgo(95), chief_complaint: "New-onset headaches", status: "done" },
    ],
    prescriptions: [
      {
        prescribed_date: isoDaysAgo(30),
        notes: "Take in the morning. Recheck BP in 2 weeks.",
        written_medications: [
          { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily", duration: "30 days" },
        ],
      },
    ],
    reports: [
      {
        document_date: isoDaysAgo(5),
        findings: [
          { test: "LDL Cholesterol", value: "132", unit: "mg/dL", normalRange: "<100", status: "high" },
          { test: "HDL Cholesterol", value: "48", unit: "mg/dL", normalRange: ">40", status: "normal" },
          { test: "Systolic BP", value: "138", unit: "mmHg", normalRange: "<120", status: "high" },
        ],
      },
    ],
  },
  {
    name: "Karthik Subramaniam",
    email: "karthik@nexora.health",
    profile: {
      date_of_birth: "1974-03-22",
      sex: "M",
      phone: "+91 98410 44556",
      blood_group: "A+",
      allergies: [],
      chronic_conditions: ["Coronary artery disease", "Hyperlipidemia"],
    },
    queue: { time: "09:45", status: "done", chief_complaint: "Chest pain evaluation" },
    pastVisits: [
      { date: isoDaysAgo(14), chief_complaint: "Exertional chest tightness", status: "done" },
      { date: isoDaysAgo(210), chief_complaint: "Post-angioplasty review", status: "done" },
    ],
    prescriptions: [
      {
        prescribed_date: isoDaysAgo(14),
        notes: "Continue dual therapy. Avoid NSAIDs.",
        written_medications: [
          { name: "Atorvastatin", dosage: "40 mg", frequency: "Once at night", duration: "90 days" },
          { name: "Aspirin", dosage: "75 mg", frequency: "Once daily", duration: "Ongoing" },
        ],
      },
    ],
    reports: [
      {
        document_date: TODAY,
        findings: [
          { test: "Troponin-I", value: "0.8", unit: "ng/mL", normalRange: "<0.04", status: "critical" },
          { test: "CK-MB", value: "12", unit: "ng/mL", normalRange: "<5", status: "high" },
          { test: "Hemoglobin", value: "14.1", unit: "g/dL", normalRange: "13.5-17.5", status: "normal" },
        ],
      },
    ],
  },
  {
    name: "Priya Menon",
    email: "priya@nexora.health",
    profile: {
      date_of_birth: "1997-11-02",
      sex: "F",
      phone: "+91 98420 77889",
      blood_group: "B+",
      allergies: ["Sulfa drugs", "Peanuts"],
      chronic_conditions: [],
    },
    queue: { time: "10:30", status: "in-progress", chief_complaint: "Lab result review" },
    pastVisits: [{ date: isoDaysAgo(20), chief_complaint: "Fatigue, requested blood panel", status: "done" }],
    prescriptions: [],
    reports: [
      {
        document_date: isoDaysAgo(2),
        findings: [
          { test: "Hemoglobin", value: "12.8", unit: "g/dL", normalRange: "12.0-15.5", status: "normal" },
          { test: "TSH", value: "2.1", unit: "mIU/L", normalRange: "0.4-4.0", status: "normal" },
          { test: "Vitamin D", value: "18", unit: "ng/mL", normalRange: "30-100", status: "low" },
        ],
      },
    ],
  },
  {
    name: "Rahul Iyer",
    email: "rahul@nexora.health",
    profile: {
      date_of_birth: "1980-09-10",
      sex: "M",
      phone: "+91 98430 22110",
      blood_group: "O-",
      allergies: [],
      chronic_conditions: ["Type 2 Diabetes"],
    },
    queue: { time: "11:15", status: "waiting", chief_complaint: "Diabetes management" },
    pastVisits: [
      { date: isoDaysAgo(45), chief_complaint: "Quarterly diabetes review", status: "done" },
      { date: isoDaysAgo(135), chief_complaint: "Foot numbness", status: "done" },
    ],
    prescriptions: [
      {
        prescribed_date: isoDaysAgo(45),
        notes: "Titrate up if fasting glucose stays >140. Repeat HbA1c in 3 months.",
        written_medications: [
          { name: "Metformin", dosage: "500 mg", frequency: "Twice daily", duration: "90 days" },
        ],
      },
    ],
    reports: [
      {
        document_date: isoDaysAgo(1),
        findings: [
          { test: "HbA1c", value: "9.4", unit: "%", normalRange: "4.0-5.6", status: "high" },
          { test: "Fasting Glucose", value: "168", unit: "mg/dL", normalRange: "70-100", status: "high" },
          { test: "eGFR", value: "88", unit: "mL/min", normalRange: ">90", status: "low" },
        ],
      },
    ],
  },
  {
    name: "Divya Nair",
    email: "divya@nexora.health",
    profile: {
      date_of_birth: "1965-03-28",
      sex: "F",
      phone: "+91 98440 55667",
      blood_group: "AB+",
      allergies: ["Aspirin"],
      chronic_conditions: ["Osteoarthritis", "Hypothyroidism"],
    },
    queue: { time: "12:00", status: "waiting", chief_complaint: "Post-op check-in" },
    pastVisits: [{ date: isoDaysAgo(10), chief_complaint: "Right knee replacement — day 10 review", status: "done" }],
    prescriptions: [
      {
        prescribed_date: isoDaysAgo(10),
        notes: "Paracetamol PRN for pain, max 3 g/day. Levothyroxine on empty stomach.",
        written_medications: [
          { name: "Levothyroxine", dosage: "50 mcg", frequency: "Once daily", duration: "Ongoing" },
          { name: "Paracetamol", dosage: "500 mg", frequency: "As needed", duration: "10 days" },
        ],
      },
    ],
    reports: [
      {
        document_date: TODAY,
        findings: [
          { test: "WBC Count", value: "2.1", unit: "x10^9/L", normalRange: "4.0-11.0", status: "critical" },
          { test: "Platelets", value: "180", unit: "x10^9/L", normalRange: "150-400", status: "normal" },
          { test: "CRP", value: "22", unit: "mg/L", normalRange: "<5", status: "high" },
        ],
      },
    ],
  },
];

async function findOrCreateUser(name, email, role) {
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: { name, password_hash: bcrypt.hashSync(PASSWORD, 10), role },
  });
  return user;
}

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  // --- demo doctor ---
  const doctor = await findOrCreateUser(DOCTOR.name, DOCTOR.email, "doctor");

  // --- a hospital + DoctorProfile to satisfy Appointment's NOT NULL FKs ---
  let hospital = await Hospital.findOne();
  if (!hospital) {
    hospital = await Hospital.create({
      name: "Nexora Demo Medical Centre",
      type: "hospital",
      address: "1 Demo Road, Erode, Tamil Nadu",
      latitude: 11.3428,
      longitude: 77.7274,
      phone: "0424-0000000",
    });
  }
  let doctorProfile = await DoctorProfile.findOne({ where: { hospital_id: hospital.id } });
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.create({
      hospital_id: hospital.id,
      name: DOCTOR.name,
      specialization: "General Physician",
      days_available: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    });
  }

  let patientCount = 0;
  let rxCount = 0;
  let reportCount = 0;
  const patientsByEmail = {};

  for (const p of PATIENTS) {
    const patient = await findOrCreateUser(p.name, p.email, "patient");
    patientsByEmail[p.email] = patient;
    patientCount += 1;

    await PatientProfile.upsert({ patient_id: patient.id, ...p.profile });

    const visits = [
      { date: TODAY, time: p.queue.time, status: p.queue.status, chief_complaint: p.queue.chief_complaint },
      ...p.pastVisits.map((v) => ({ date: v.date, time: "10:00", status: v.status, chief_complaint: v.chief_complaint })),
    ];
    for (const v of visits) {
      await Appointment.findOrCreate({
        where: { patient_id: patient.id, appointment_date: v.date, appointment_time: v.time },
        defaults: {
          patient_id: patient.id,
          doctor_id: doctorProfile.id,
          doctor_user_id: doctor.id,
          hospital_id: hospital.id,
          appointment_date: v.date,
          appointment_time: v.time,
          status: v.status,
          chief_complaint: v.chief_complaint,
        },
      });
    }

    const existingRx = await Prescription.count({
      where: { patient_id: patient.id, source: "written" },
    });
    if (!existingRx) {
      for (const rx of p.prescriptions) {
        await Prescription.create({
          patient_id: patient.id,
          doctor_user_id: doctor.id,
          source: "written",
          status: "done",
          file_path: null,
          patient_name: p.name,
          doctor_name: DOCTOR.name,
          prescribed_date: rx.prescribed_date,
          written_medications: rx.written_medications,
          notes: rx.notes,
        });
        rxCount += 1;
      }
    }

    const existingReports = await MedicalReport.count({ where: { patient_id: patient.id } });
    if (!existingReports) {
      for (const r of p.reports) {
        await MedicalReport.create({
          patient_id: patient.id,
          file_path: `reports/demo-${patient.id}.txt`,
          status: "done",
          patient_name: p.name,
          doctor_name: DOCTOR.name,
          facility_name: hospital.name,
          document_date: r.document_date,
          findings: r.findings,
        });
        reportCount += 1;
      }
    }
  }

  // --- a couple of reports still awaiting review (Pending Reports card) ---
  let pendingCount = 0;
  if (!(await MedicalReport.count({ where: { status: "pending" } }))) {
    await MedicalReport.bulkCreate([
      {
        patient_id: patientsByEmail["priya@nexora.health"].id,
        file_path: "reports/pending-cbc.jpg",
        original_filename: "cbc_panel_scan.jpg",
        status: "pending",
        patient_name: "Priya Menon",
        document_date: TODAY,
      },
      {
        patient_id: patientsByEmail["rahul@nexora.health"].id,
        file_path: "reports/pending-lipids.jpg",
        original_filename: "lipid_profile_scan.jpg",
        status: "pending",
        patient_name: "Rahul Iyer",
        document_date: TODAY,
      },
    ]);
    pendingCount = 2;
  }

  // --- a couple of unread patient -> doctor messages (Unread Messages card) ---
  let msgCount = 0;
  if (!(await Message.count({ where: { receiver_id: doctor.id } }))) {
    await Message.bulkCreate([
      {
        sender_id: patientsByEmail["ananya@nexora.health"].id,
        sender_role: "patient",
        receiver_id: doctor.id,
        receiver_role: "doctor",
        subject: "BP still a little high",
        body: "Morning readings around 140/90 this week even on the Amlodipine. Should I be worried?",
      },
      {
        sender_id: patientsByEmail["rahul@nexora.health"].id,
        sender_role: "patient",
        receiver_id: doctor.id,
        receiver_role: "doctor",
        subject: "HbA1c result",
        body: "Saw the 9.4% — quite concerned. Can we go over next steps at my appointment?",
      },
    ]);
    msgCount = 2;
  }

  console.log(
    `Seeded demo doctor (${DOCTOR.email}) + ${patientCount} patients, ` +
      `${rxCount} written prescriptions, ${reportCount} lab reports, ` +
      `${pendingCount} pending reports, ${msgCount} patient messages.`
  );
  console.log(`All demo logins use password: ${PASSWORD}`);
  console.log(`Patients: ${PATIENTS.map((p) => p.email).join(", ")}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Doctor demo seeding failed:", err);
  process.exit(1);
});
