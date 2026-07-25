const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { sendMessage, getHistory, clearHistory } = require("../controllers/chatController");

// Any authenticated user (patient, doctor, or admin) can use the chatbot.
router.post("/message", verifyToken, sendMessage);
router.get("/history", verifyToken, getHistory);
router.delete("/history", verifyToken, clearHistory);

module.exports = router;
