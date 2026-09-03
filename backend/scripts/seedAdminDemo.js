// Run manually with:  node scripts/seedAdminDemo.js   (or: npm run seed:admin)
//
// Seeds the admin dashboard demo: one admin login, plus three doctor accounts
// each with a PENDING DoctorVerification so the review queue isn't empty.
//
// Idempotent — safe to run repeatedly. Fictional people.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("../src/config/db");
const User = require("../src/models/User");
const DoctorVerification = require("../src/models/DoctorVerification");
const Hospital = require("../src/models/Hospital");
const HospitalDoctor = require("../src/models/HospitalDoctor");

const PASSWORD = "demo1234";

const ADMIN = { name: "Nexora Admin", email: "admin@nexora.health" };

const PENDING_DOCTORS = [
  {
    name: "Dr. Arjun Verma",
    email: "dr.arjun@nexora.health",
    license_number: "TN-MED-88213",
    specialization: "Cardiology",
    hospital_affiliation: "Apollo Speciality, Chennai",
  },
  {
    name: "Dr. Sneha Kulkarni",
    email: "dr.sneha@nexora.health",
    license_number: "MH-MED-40917",
    specialization: "Endocrinology",
    hospital_affiliation: "Ruby Hall Clinic, Pune",
  },
  {
    name: "Dr. Imran Sheikh",
    email: "dr.imran@nexora.health",
    license_number: "KA-MED-55602",
    specialization: "General Medicine",
    hospital_affiliation: "Manipal Hospital, Bengaluru",
  },
];

async function findOrCreateUser(name, email, role) {
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      name,
      password_hash: bcrypt.hashSync(PASSWORD, 10),
      role,
      // Demo accounts skip email verification.
      is_email_verified: true,
      email_verified_at: new Date(),
    },
  });
  return user;
}

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const admin = await findOrCreateUser(ADMIN.name, ADMIN.email, "admin");

  let pendingCount = 0;
  for (const d of PENDING_DOCTORS) {
    const doctor = await findOrCreateUser(d.name, d.email, "doctor");
    const [verification, created] = await DoctorVerification.findOrCreate({
      where: { user_id: doctor.id },
      defaults: {
        user_id: doctor.id,
        license_number: d.license_number,
        specialization: d.specialization,
        hospital_affiliation: d.hospital_affiliation,
        status: "pending",
      },
    });
    if (created) pendingCount += 1;
    else if (verification.status === "pending") pendingCount += 1;
  }

  // --- Hospitals & Departments demo ---
  const HOSPITALS = [
    {
      name: "Nexora City Hospital",
      type: "hospital",
      address: "12 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      latitude: 12.9757,
      longitude: 77.6011,
      phone: "080-40001000",
      departments: ["Cardiology", "Endocrinology", "General Medicine", "Orthopedics"],
    },
    {
      name: "Harbour Clinic",
      type: "clinic",
      address: "5 Beach Road",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      phone: "044-28008800",
      departments: ["General Medicine", "Pediatrics"],
    },
  ];

  let hospitalCount = 0;
  let linkCount = 0;
  const allDoctors = await User.findAll({ where: { role: "doctor" } });

  for (const h of HOSPITALS) {
    const [hospital, created] = await Hospital.findOrCreate({
      where: { name: h.name },
      defaults: { ...h, is_active: true },
    });
    if (created) hospitalCount += 1;

    // Assign up to two doctors to the first hospital so booking has data.
    if (hospital.name === "Nexora City Hospital") {
      for (const [i, doc] of allDoctors.slice(0, 2).entries()) {
        const [, made] = await HospitalDoctor.findOrCreate({
          where: { hospital_id: hospital.id, user_id: doc.id },
          defaults: {
            hospital_id: hospital.id,
            user_id: doc.id,
            department: h.departments[i] || "General Medicine",
            consultation_fee: 500 + i * 250,
          },
        });
        if (made) linkCount += 1;
      }
    }
  }

  console.log(
    `Seeded admin (${ADMIN.email}) + ${PENDING_DOCTORS.length} doctor accounts, ` +
      `${pendingCount} verification(s) in the pending queue, ` +
      `${hospitalCount} hospital(s), ${linkCount} hospital-doctor link(s).`
  );
  console.log(`All demo logins use password: ${PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Admin demo seeding failed:", err);
  process.exit(1);
});
