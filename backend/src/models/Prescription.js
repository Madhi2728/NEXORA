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
      // Relative path under /uploads, e.g. "prescriptions/xyz.jpg".
      // Nullable: doctor-written prescriptions (source === "written") have no
      // uploaded image.
      type: DataTypes.STRING,
      allowNull: true,
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
    // ----- Doctor-written prescriptions (from PrescriptionNotebook) -----
    source: {
      // "ocr"     -> uploaded + OCR'd prescription image (default, legacy rows)
      // "written" -> typed by a doctor in the Prescription Notebook
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ocr",
    },
    written_medications: {
      // Array of { name, dosage, frequency, duration }
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    prescribed_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    doctor_user_id: {
      // The doctor User who wrote it (null for OCR uploads)
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: User, key: "id" },
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
