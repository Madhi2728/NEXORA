const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Hospital = require("./Hospital");
const User = require("./User");

// Join table: which doctor Users practise at which Hospital, in what
// department, for what fee. Managed from the admin Hospital Directory.
// (Distinct from DoctorProfile, which is the older map-only demo directory.)
const HospitalDoctor = sequelize.define(
  "HospitalDoctor",
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    department: { type: DataTypes.STRING, allowNull: true },
    consultation_fee: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "hospital_doctors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["hospital_id", "user_id"] }],
  }
);

// NB: the "doctors" alias on Hospital is already taken by DoctorProfile
// (the legacy map directory). This join is exposed via `doctorLinks` instead;
// controllers read through that + HospitalDoctor.belongsTo(User, as: "doctor").
HospitalDoctor.belongsTo(Hospital, { foreignKey: "hospital_id", as: "hospital" });
HospitalDoctor.belongsTo(User, { foreignKey: "user_id", as: "doctor" });
Hospital.hasMany(HospitalDoctor, { foreignKey: "hospital_id", as: "doctorLinks" });

module.exports = HospitalDoctor;
