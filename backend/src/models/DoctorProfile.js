const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Hospital = require("./Hospital");

// A lightweight demo doctor directory (not tied to real User/login accounts
// yet) so we can show "doctors available at this hospital" on the map
// without requiring every doctor to have registered on the platform.
const DoctorProfile = sequelize.define(
  "DoctorProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Hospital, key: "id" },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    specialization: { type: DataTypes.STRING, allowNull: false },
    days_available: {
      // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    start_time: { type: DataTypes.STRING, allowNull: false, defaultValue: "09:00" },
    end_time: { type: DataTypes.STRING, allowNull: false, defaultValue: "17:00" },
    slot_duration_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
  },
  {
    tableName: "doctor_profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

DoctorProfile.belongsTo(Hospital, { foreignKey: "hospital_id", as: "hospital" });
Hospital.hasMany(DoctorProfile, { foreignKey: "hospital_id", as: "doctors" });

module.exports = DoctorProfile;
