// Run manually with: node scripts/seedDemoData.js
// Populates a handful of demo hospitals/clinics and doctors so the
// Appointment Booking map has something to show. Fictional names --
// not real institutions or real doctors.
require("dotenv").config();
const { sequelize } = require("../src/config/db");
const Hospital = require("../src/models/Hospital");
const DoctorProfile = require("../src/models/DoctorProfile");

// Coordinates centered around Erode, Tamil Nadu, with small offsets.
const DEMO_HOSPITALS = [
  {
    name: "City Care Multispecialty Hospital",
    type: "hospital",
    address: "12 Perundurai Rd, Erode, Tamil Nadu",
    latitude: 11.3428,
    longitude: 77.7274,
    phone: "0424-1234567",
    doctors: [
      { name: "Dr. Anitha Raman", specialization: "General Physician", days_available: ["Mon", "Tue", "Wed", "Thu", "Fri"], start_time: "09:00", end_time: "13:00" },
      { name: "Dr. Suresh Kumar", specialization: "Cardiologist", days_available: ["Mon", "Wed", "Fri"], start_time: "14:00", end_time: "18:00" },
    ],
  },
  {
    name: "Green Valley Clinic",
    type: "clinic",
    address: "45 Brough Road, Erode, Tamil Nadu",
    latitude: 11.3502,
    longitude: 77.7085,
    phone: "0424-2345678",
    doctors: [
      { name: "Dr. Priya Nathan", specialization: "Pediatrician", days_available: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], start_time: "10:00", end_time: "16:00" },
    ],
  },
  {
    name: "Metro Health Hospital",
    type: "hospital",
    address: "78 Sathy Road, Erode, Tamil Nadu",
    latitude: 11.3330,
    longitude: 77.7410,
    phone: "0424-3456789",
    doctors: [
      { name: "Dr. Karthik Subramaniam", specialization: "Orthopedic Surgeon", days_available: ["Tue", "Thu", "Sat"], start_time: "09:00", end_time: "14:00" },
      { name: "Dr. Meera Balan", specialization: "Dermatologist", days_available: ["Mon", "Wed", "Fri"], start_time: "11:00", end_time: "17:00" },
    ],
  },
  {
    name: "Sunrise Family Clinic",
    type: "clinic",
    address: "23 Chennimalai Road, Erode, Tamil Nadu",
    latitude: 11.3555,
    longitude: 77.7300,
    phone: "0424-4567890",
    doctors: [
      { name: "Dr. Vignesh Iyer", specialization: "General Physician", days_available: ["Mon", "Tue", "Wed", "Thu", "Fri"], start_time: "08:00", end_time: "12:00" },
    ],
  },
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const h of DEMO_HOSPITALS) {
    const { doctors, ...hospitalData } = h;
    const [hospital] = await Hospital.findOrCreate({
      where: { name: hospitalData.name },
      defaults: hospitalData,
    });

    for (const d of doctors) {
      await DoctorProfile.findOrCreate({
        where: { name: d.name, hospital_id: hospital.id },
        defaults: { ...d, hospital_id: hospital.id },
      });
    }
  }

  console.log(`Seeded ${DEMO_HOSPITALS.length} hospitals/clinics with their doctors.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
