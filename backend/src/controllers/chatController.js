const ChatMessage = require("../models/ChatMessage");
const ChatEvent = require("../models/ChatEvent");
const { getChatReply } = require("../config/openaiClient");
const { detectCrisis, RESPONSES } = require("../utils/crisisDetector");

const HISTORY_LIMIT = 12; // recent messages sent as context to the model

// POST /api/chat/message   body: { message: "..." }
async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    // Always save the user's message first, regardless of what happens next.
    await ChatMessage.create({ user_id: req.user.id, role: "user", content: message.trim() });
    ChatEvent.log({ user_id: req.user.id, type: "message" });

    // Safety net: for crisis-pattern messages, skip the LLM entirely and
    // return a fixed, reliable response with real emergency resources.
    const crisisType = detectCrisis(message);
    if (crisisType) {
      const reply = RESPONSES[crisisType];
      await ChatMessage.create({ user_id: req.user.id, role: "assistant", content: reply });
      ChatEvent.log({ user_id: req.user.id, type: "crisis_flag", metadata: { crisisType } });
      return res.json({ reply, crisis: true });
    }

    const recent = await ChatMessage.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
      limit: HISTORY_LIMIT,
    });
    const history = recent
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    const { reply, provider, fellBack } = await getChatReply(history);
    await ChatMessage.create({ user_id: req.user.id, role: "assistant", content: reply });
    if (fellBack) {
      ChatEvent.log({ user_id: req.user.id, type: "provider_fallback", provider });
    }

    return res.json({ reply, crisis: false });
  } catch (err) {
    console.error("Chat error:", err.message);
    return res.status(500).json({
      message: "The assistant is temporarily unavailable. Please try again shortly.",
    });
  }
}

// GET /api/chat/history
async function getHistory(req, res) {
  try {
    const messages = await ChatMessage.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "ASC"]],
      limit: 100,
    });
    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load chat history." });
  }
}

// DELETE /api/chat/history
async function clearHistory(req, res) {
  try {
    await ChatMessage.destroy({ where: { user_id: req.user.id } });
    return res.json({ message: "Cleared." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not clear chat history." });
  }
}

module.exports = { sendMessage, getHistory, clearHistory };
