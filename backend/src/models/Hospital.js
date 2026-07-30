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
    address: { type: DataTypes.STRING, allowNull: false },
    latitude: { type: DataTypes.FLOAT, allowNull: false },
    longitude: { type: DataTypes.FLOAT, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "hospitals",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Hospital;
