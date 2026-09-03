const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Hospital = sequelize.define(
  "Hospital",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      // "hospital" | "clinic"
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "hospital",
    },
    // address / lat / long relaxed to nullable: an admin can register a
    // hospital before it's geocoded. Existing map/booking code already guards
    // for missing coordinates.
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    departments: {
      // Array of plain strings, e.g. ["Cardiology", "Pediatrics"]
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "hospitals",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Hospital;
