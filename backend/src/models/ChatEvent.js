const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// Lightweight telemetry for the AI chatbot — one row per notable event so the
// admin "AI Monitor" can chart volume and surface safety signals. Written
// fire-and-forget from chatController / chatRateLimit; a failed insert must
// never break a chat turn.
//
// type:
//   "message"            -> a user sent a chatbot message
//   "rate_limited"       -> a request was rejected by the per-user limiter
//   "crisis_flag"        -> crisisDetector matched (metadata.crisisType)
//   "provider_fallback"  -> primary LLM failed, answered via the fallback
const ChatEvent = sequelize.define(
  "ChatEvent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    type: { type: DataTypes.STRING, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: true }, // "openai" | "groq"
    metadata: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
  },
  {
    tableName: "chat_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ChatEvent.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Fire-and-forget helper — swallows all errors so callers can `void log(...)`.
ChatEvent.log = function log(fields) {
  return ChatEvent.create(fields).catch((err) => {
    console.warn("ChatEvent.log failed:", err.message);
  });
};

module.exports = ChatEvent;
