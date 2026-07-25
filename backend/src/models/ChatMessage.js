const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    role: {
      // "user" | "assistant"
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "chat_messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ChatMessage.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = ChatMessage;
