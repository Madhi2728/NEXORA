const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// One row per admin data export (Reports & Exports panel). Records who pulled
// what and how much — a lightweight companion to the AuditLog entry that is
// also written for every export.
const ExportLog = sequelize.define(
  "ExportLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    report_type: { type: DataTypes.STRING, allowNull: false },
    format: { type: DataTypes.STRING, allowNull: true }, // "pdf" | "csv"
    date_from: { type: DataTypes.DATEONLY, allowNull: true },
    date_to: { type: DataTypes.DATEONLY, allowNull: true },
    row_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: "export_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ExportLog.belongsTo(User, { foreignKey: "admin_user_id", as: "admin" });

module.exports = ExportLog;
