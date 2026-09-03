// Wipe every user (and everything that references a user) and re-seed the
// demo accounts. Destructive — guarded behind --confirm and blocked in prod.
//
//   node scripts/resetUsers.js            -> dry run, prints what it would do
//   node scripts/resetUsers.js --confirm  -> actually does it
//
// Also exposed as:  npm run reset:users -- --confirm
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("../src/config/db");

// Register every model so sequelize.sync() knows the full schema.
require("../src/models/User");
require("../src/models/Vital");
require("../src/models/Prescription");
require("../src/models/MedicalReport");
require("../src/models/ChatMessage");
require("../src/models/Hospital");
require("../src/models/DoctorProfile");
require("../src/models/Appointment");
require("../src/models/PatientProfile");
require("../src/models/Message");
require("../src/models/DoctorVerification");
require("../src/models/AuditLog");
require("../src/models/ChatEvent");
require("../src/models/HospitalDoctor");
require("../src/models/RequestMetric");
require("../src/models/ExportLog");
require("../src/models/OtpToken");

const CONFIRMED = process.argv.includes("--confirm");
const PASSWORD = "demo1234";

// FK-safe delete order — children first, users last. Derived by grepping
// `model: User` / `belongsTo(User` across src/models. Raw DELETE (not the
// Sequelize model) so AuditLog's append-only hooks don't block us and so the
// DB itself enforces FK order — if a table with a user FK is missing here,
// the DELETE on `users` will fail loudly rather than silently orphan rows.
const DELETE_ORDER = [
  "otp_tokens",
  "chat_events",
  "chat_messages",
  "audit_logs",
  "export_logs",
  "messages",
  "prescriptions",
  "medical_reports",
  "appointments",
  "hospital_doctors",
  "doctor_verifications",
  "patient_profiles",
  "vitals",
  "users",
];

// Match the existing seed pattern (seedDoctorDemo.js / seedAdminDemo.js):
// dr.demo doctor, admin, and the first-name patient emails.
//
// Every patient carries a `profile` so this script re-creates the matching
// patient_profiles row itself — the patient dashboard and the doctor/admin
// patient-record views both expect one to exist for every patient user.
// Profile shapes mirror seedDoctorDemo.js.
const DEMO_ACCOUNTS = [
  { name: "Dr. Meera Nair", email: "dr.demo@nexora.health", role: "doctor" },
  { name: "Nexora Admin", email: "admin@nexora.health", role: "admin" },
  {
    name: "Ananya Raghavan",
    email: "ananya@nexora.health",
    role: "patient",
    profile: {
      date_of_birth: "1992-06-15",
      sex: "F",
      phone: "+91 98400 11223",
      blood_group: "O+",
      allergies: ["Penicillin"],
      chronic_conditions: ["Hypertension"],
    },
  },
  {
    name: "Karthik Subramaniam",
    email: "karthik@nexora.health",
    role: "patient",
    profile: {
      date_of_birth: "1974-03-22",
      sex: "M",
      phone: "+91 98410 44556",
      blood_group: "A+",
      allergies: [],
      chronic_conditions: ["Coronary artery disease", "Hyperlipidemia"],
    },
  },
  {
    name: "Priya Menon",
    email: "priya@nexora.health",
    role: "patient",
    profile: {
      date_of_birth: "1997-11-02",
      sex: "F",
      phone: "+91 98420 77889",
      blood_group: "B+",
      allergies: ["Sulfa drugs", "Peanuts"],
      chronic_conditions: [],
    },
  },
  {
    name: "Rahul Iyer",
    email: "rahul@nexora.health",
    role: "patient",
    profile: {
      date_of_birth: "1980-09-10",
      sex: "M",
      phone: "+91 98430 22110",
      blood_group: "O-",
      allergies: [],
      chronic_conditions: ["Type 2 Diabetes"],
    },
  },
  {
    name: "Divya Nair",
    email: "divya@nexora.health",
    role: "patient",
    profile: {
      date_of_birth: "1965-03-28",
      sex: "F",
      phone: "+91 98440 55667",
      blood_group: "AB+",
      allergies: ["Aspirin"],
      chronic_conditions: ["Osteoarthritis", "Hypothyroidism"],
    },
  },
];

async function countRows(table, transaction) {
  const [rows] = await sequelize.query(`SELECT COUNT(*)::int AS n FROM "${table}"`, {
    transaction,
  });
  return rows[0].n;
}

async function run() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run: NODE_ENV=production.");
    process.exit(1);
  }

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  // Preview.
  console.log("\nThis will DELETE all rows from, in order:");
  const preview = {};
  for (const table of DELETE_ORDER) {
    preview[table] = await countRows(table);
    console.log(`  ${table.padEnd(22)} ${preview[table]} row(s)`);
  }
  console.log(`\nThen re-create ${DEMO_ACCOUNTS.length} demo accounts (password: ${PASSWORD}).`);

  if (!CONFIRMED) {
    console.log("\nDry run — nothing changed. Re-run with --confirm to proceed.\n");
    process.exit(0);
  }

  const deleted = {};
  await sequelize.transaction(async (transaction) => {
    for (const table of DELETE_ORDER) {
      deleted[table] = await countRows(table, transaction);
      await sequelize.query(`DELETE FROM "${table}"`, { transaction });
    }
  });

  const created = [];
  let profileCount = 0;
  const now = new Date();
  await sequelize.transaction(async (transaction) => {
    for (const acc of DEMO_ACCOUNTS) {
      const [user] = await sequelize
        .model("User")
        .findOrCreate({
          where: { email: acc.email },
          defaults: {
            name: acc.name,
            email: acc.email,
            role: acc.role,
            password_hash: bcrypt.hashSync(PASSWORD, 10),
            is_email_verified: true,
            email_verified_at: now,
          },
          transaction,
        });
      created.push({ email: user.email, role: user.role });

      // Every patient must have a patient_profiles row — the dashboards
      // dereference profile fields directly.
      if (acc.role === "patient") {
        await sequelize
          .model("PatientProfile")
          .upsert({ patient_id: user.id, ...(acc.profile || {}) }, { transaction });
        profileCount += 1;
      }
    }
  });

  console.log("\n─── Rows deleted ───────────────────────────");
  let total = 0;
  for (const table of DELETE_ORDER) {
    total += deleted[table];
    console.log(`  ${table.padEnd(22)} ${deleted[table]}`);
  }
  console.log(`  ${"TOTAL".padEnd(22)} ${total}`);

  console.log("\n─── Demo accounts created (email verified) ──");
  for (const c of created) {
    console.log(`  ${c.email.padEnd(28)} ${c.role}`);
  }
  console.log(`\n${profileCount} patient profile(s) created.`);
  console.log(`\nAll demo logins use password: ${PASSWORD}\n`);
  process.exit(0);
}

run().catch((err) => {
  console.error("resetUsers failed:", err);
  process.exit(1);
});
