const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");
const Hospital = require("./Hospital");
const DoctorProfile = require("./DoctorProfile");

const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    // Nullable: newer bookings come from the admin-managed Hospital Directory
    // and attach a doctor USER (doctor_user_id) rather than a DoctorProfile.
    // Legacy map bookings still set this.
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: DoctorProfile, key: "id" },
    },
    // The logged-in doctor User this appointment belongs to (nullable — the
    // legacy patient-facing booking flow books against the DoctorProfile
    // directory, which isn't tied to real doctor logins. Set when a doctor's
    // own queue is seeded / created, or when booked via the Hospital Directory).
    doctor_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Hospital, key: "id" },
    },
    appointment_date: { type: DataTypes.DATEONLY, allowNull: false },
    appointment_time: { type: DataTypes.STRING, allowNull: false }, // e.g. "10:30"
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "confirmed" },
    chief_complaint: { type: DataTypes.STRING, allowNull: true }, // reason for visit
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "appointments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Appointment.belongsTo(User, { foreignKey: "patient_id", as: "patient" });
Appointment.belongsTo(User, { foreignKey: "doctor_user_id", as: "doctorUser" });
Appointment.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });
Appointment.belongsTo(Hospital, { foreignKey: "hospital_id", as: "hospital" });

module.exports = Appointment;
