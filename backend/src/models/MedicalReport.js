const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const MedicalReport = sequelize.define(
  "MedicalReport",
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
    original_filename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ocr_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    findings: {
      // Array of { test, value, unit, normalRange, status }
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    detected_medicines: {
      // Array of { name, aliases, category, commonUse }
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "medical_reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

MedicalReport.belongsTo(User, { foreignKey: "patient_id", as: "patient" });

module.exports = MedicalReport;
