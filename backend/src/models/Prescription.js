const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Prescription = sequelize.define(
  "Prescription",
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
      // Relative path under /uploads, e.g. "prescriptions/xyz.jpg"
      type: DataTypes.STRING,
      allowNull: false,
    },
    ocr_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      // pending -> processing -> done | failed
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    detected_medicines: {
      // Array of { name, aliases, category, commonUse } -- same shape as
      // Medical Report Analysis, so both can share the same table/PDF co...
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    patient_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    doctor_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facility_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    document_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    structured_medications: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prescriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Prescription.belongsTo(User, { foreignKey: "patient_id", as: "patient" });

module.exports = Prescription;
