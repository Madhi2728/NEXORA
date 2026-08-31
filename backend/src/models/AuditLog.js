const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// Append-only record of every mutating admin action. Rows are written by the
// admin controller via writeAudit() and are NEVER updated or deleted — the
// hooks below turn any attempt into a thrown error so the invariant can't be
// broken by a stray .update()/.destroy() elsewhere in the codebase.
//
// `target_id` is STRING, not INTEGER: every primary key in this database is a
// UUID, so audit targets (users, verifications, ...) are UUID strings.
const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actor_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    action: { type: DataTypes.STRING, allowNull: false },
    target_type: { type: DataTypes.STRING, allowNull: true },
    target_id: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
    ip_address: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

function reject() {
  throw new Error("AuditLog is append-only: rows cannot be modified or deleted.");
}
AuditLog.beforeUpdate(reject);
AuditLog.beforeBulkUpdate(reject);
AuditLog.beforeDestroy(reject);
AuditLog.beforeBulkDestroy(reject);

AuditLog.belongsTo(User, { foreignKey: "actor_user_id", as: "actor" });

module.exports = AuditLog;
