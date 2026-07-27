const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Vital = sequelize.define(
  "Vital",
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
    type: {
      // Kept as STRING (not ENUM) so new vital types can be added later
      // without a schema migration.
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            "blood_pressure",
            "heart_rate",
            "weight",
            "blood_sugar",
            "temperature",
            "spo2",
            "hemoglobin",
          ],
        ],
      },
    },
    value: {
      // Stored as string so it can hold compound readings like "120/80"
      // for blood pressure, as well as plain numbers like "72".
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "vitals",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Vital.belongsTo(User, { foreignKey: "patient_id", as: "patient" });

module.exports = Vital;
