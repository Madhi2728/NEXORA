require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize, connectDB } = require("./config/db");
require("./models/User");
require("./models/Vital"); // registers the model so sequelize.sync() creates its table
require("./models/Prescription");
require("./models/MedicalReport");
require("./models/ChatMessage");
require("./models/Hospital");
require("./models/DoctorProfile");
require("./models/Appointment");
require("./models/PatientProfile");
require("./models/Message");
require("./models/DoctorVerification");
require("./models/AuditLog");
require("./models/ChatEvent");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const vitalsRoutes = require("./routes/vitalsRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const medicalReportRoutes = require("./routes/medicalReportRoutes");
const drugInteractionRoutes = require("./routes/drugInteractionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const medicineInfoRoutes = require("./routes/medicineInfoRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { warmCache } = require("./config/rxnormClient");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Serve uploaded prescription images (dev only — swap for S3/Cloud Storage
// signed URLs before going to production, since this exposes files by path).
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-reports", medicalReportRoutes);
app.use("/api/drug-interactions", drugInteractionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/medicine-info", medicineInfoRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // Auto-creates/updates the `users` table from the model. Replace with
  // real migrations (see /database/migrations) once schema stabilizes.
  // { alter: true } lets Sequelize add new columns (like reset_otp) to tables
  // that already exist from earlier runs, instead of only creating brand-new
  // tables. Fine for development; replace with real migrations for production.
  await sequelize.sync({ alter: true });
  warmCache(); // fire-and-forget, doesn't block server startup
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

start();
