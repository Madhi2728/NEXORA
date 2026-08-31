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
    defaults: { name, password_hash: bcrypt.hashSync(PASSWORD, 10), role },
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

  console.log(
    `Seeded admin (${ADMIN.email}) + ${PENDING_DOCTORS.length} doctor accounts, ` +
      `${pendingCount} verification(s) in the pending queue.`
  );
  console.log(`All demo logins use password: ${PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Admin demo seeding failed:", err);
  process.exit(1);
});
