require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize, connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // Auto-creates/updates the `users` table from the model. Replace with
  // real migrations (see /database/migrations) once schema stabilizes.
  await sequelize.sync();
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

start();
