const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { sendMessage, getHistory, clearHistory } = require("../controllers/chatController");
const { chatRateLimit } = require("../middleware/chatRateLimit");

// Any authenticated user (patient, doctor, or admin) can use the chatbot.
router.post("/message", verifyToken, chatRateLimit, sendMessage);
router.get("/history", verifyToken, getHistory);
router.delete("/history", verifyToken, clearHistory);

module.exports = router;