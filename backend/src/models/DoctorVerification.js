const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// One-to-one with a doctor User: the license / affiliation details an admin
// reviews before a doctor account is trusted. `user_id` is unique so a doctor
// has exactly one verification record; it starts life as "pending".
const DoctorVerification = sequelize.define(
  "DoctorVerification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: User, key: "id" },
    },
    license_number: { type: DataTypes.STRING, allowNull: true },
    specialization: { type: DataTypes.STRING, allowNull: true },
    hospital_affiliation: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "doctor_verifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

DoctorVerification.belongsTo(User, { foreignKey: "user_id", as: "user" });
DoctorVerification.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });
User.hasOne(DoctorVerification, { foreignKey: "user_id", as: "verification" });

module.exports = DoctorVerification;
