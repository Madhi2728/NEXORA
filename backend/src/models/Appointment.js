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
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: DoctorProfile, key: "id" },
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Hospital, key: "id" },
    },
    appointment_date: { type: DataTypes.DATEONLY, allowNull: false },
    appointment_time: { type: DataTypes.STRING, allowNull: false }, // e.g. "10:30"
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "confirmed" },
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
Appointment.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });
Appointment.belongsTo(Hospital, { foreignKey: "hospital_id", as: "hospital" });

module.exports = Appointment;
