const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// Async direct messaging between users (v1: no real-time / WebSocket — the
// recipient sees new messages on their next load, and an unread-count badge
// polls periodically). Roles are denormalized onto the row so an inbox can be
// rendered without a join, mirroring how ChatMessage stores `role`.
const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    sender_role: { type: DataTypes.STRING, allowNull: false },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    receiver_role: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    read_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

module.exports = Message;
