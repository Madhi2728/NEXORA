const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// One-to-one profile for a patient User: the demographic + clinical-context
// fields that don't belong on the auth `users` table (date of birth, sex,
// contact number, known allergies, chronic conditions). Populated by the demo
// seed for now; a patient-facing "health profile" editor can write to it later.
const PatientProfile = sequelize.define(
  "PatientProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: User, key: "id" },
    },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    sex: { type: DataTypes.STRING, allowNull: true }, // "M" | "F" | "Other"
    phone: { type: DataTypes.STRING, allowNull: true },
    blood_group: { type: DataTypes.STRING, allowNull: true },
    allergies: {
      // Array of plain strings, e.g. ["Penicillin", "Peanuts"]
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    chronic_conditions: {
      // Array of plain strings, e.g. ["Type 2 Diabetes", "Hypertension"]
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: "patient_profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

PatientProfile.belongsTo(User, { foreignKey: "patient_id", as: "patient" });
User.hasOne(PatientProfile, { foreignKey: "patient_id", as: "profile" });

module.exports = PatientProfile;
