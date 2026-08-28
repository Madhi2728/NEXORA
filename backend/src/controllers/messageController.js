const Message = require("../models/Message");
const User = require("../models/User");

function canAccessInbox(req, userId) {
  return req.user.id === userId || req.user.role === "admin";
}

// POST /api/messages   (any authenticated user)
async function sendMessage(req, res) {
  try {
    const { receiver_id, receiver_role, subject, body } = req.body;

    if (!receiver_id || !body || !body.trim()) {
      return res
        .status(400)
        .json({ message: "A recipient and a message body are required." });
    }

    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    const message = await Message.create({
      sender_id: req.user.id,
      sender_role: req.user.role,
      receiver_id,
      receiver_role: receiver_role || receiver.role,
      subject: subject?.trim() || null,
      body: body.trim(),
    });

    return res.status(201).json({ message });
  } catch (err) {
    console.error("sendMessage failed:", err);
    return res.status(500).json({ message: "Could not send message." });
  }
}

// GET /api/messages/:userId   (the user themselves, or an admin)
async function getInbox(req, res) {
  try {
    const { userId } = req.params;
    if (!canAccessInbox(req, userId)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const messages = await Message.findAll({
      where: { receiver_id: userId },
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
      order: [["created_at", "DESC"]],
    });

    return res.json({ messages });
  } catch (err) {
    console.error("getInbox failed:", err);
    return res.status(500).json({ message: "Could not load inbox." });
  }
}

// GET /api/messages/:userId/unread-count   (the user themselves, or an admin)
async function getUnreadCount(req, res) {
  try {
    const { userId } = req.params;
    if (!canAccessInbox(req, userId)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const count = await Message.count({
      where: { receiver_id: userId, read_at: null },
    });

    return res.json({ count });
  } catch (err) {
    console.error("getUnreadCount failed:", err);
    return res.status(500).json({ message: "Could not load unread count." });
  }
}

// PATCH /api/messages/:id/read   (only the receiver)
async function markRead(req, res) {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: "Not found." });
    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!message.read_at) {
      message.read_at = new Date();
      await message.save();
    }

    return res.json({ message });
  } catch (err) {
    console.error("markRead failed:", err);
    return res.status(500).json({ message: "Could not update message." });
  }
}

module.exports = { sendMessage, getInbox, getUnreadCount, markRead };
