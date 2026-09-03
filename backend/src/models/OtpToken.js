const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Transient, multi-purpose one-time passcodes. Kept in their own table rather
// than on the users row because a single email can have concurrent codes for
// different purposes, they expire fast, and old rows get purged.
//
// The plaintext OTP is NEVER stored — only its bcrypt hash. `email` is stored
// lowercased so lookups don't depend on the caller normalising case.
const OtpToken = sequelize.define(
  "OtpToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
    },
    otp_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM("signup_verification", "password_reset"),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    consumed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "otp_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["email", "purpose"] }],
  }
);

module.exports = OtpToken;
