const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getInbox,
  getUnreadCount,
  markRead,
} = require("../controllers/messageController");

// Async direct messaging (no real-time). Any authenticated user can send;
// only the recipient (or an admin) can read an inbox / its unread count.
router.post("/", verifyToken, sendMessage);
router.get("/:userId/unread-count", verifyToken, getUnreadCount);
router.get("/:userId", verifyToken, getInbox);
router.patch("/:id/read", verifyToken, markRead);

module.exports = router;
