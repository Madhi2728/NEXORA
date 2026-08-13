// backend/src/middleware/chatRateLimit.js
//
// Simple in-memory per-user rate limiter for the chatbot endpoint.
// Prevents one user from burning through your OpenAI/Groq quota.
// Fine for a single backend instance; swap for a Redis-backed limiter
// if you ever run multiple backend processes/instances.

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 8; // max chat messages per user per window

const hits = new Map(); // userId -> [timestamps]

function chatRateLimit(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return next(); // let auth middleware handle missing auth

  const now = Date.now();
  const timestamps = (hits.get(userId) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      message: "You're sending messages too quickly. Please wait a moment and try again.",
    });
  }

  timestamps.push(now);
  hits.set(userId, timestamps);
  next();
}

// Periodic cleanup so the map doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of hits.entries()) {
    const fresh = timestamps.filter((t) => now - t < WINDOW_MS);
    if (fresh.length) hits.set(userId, fresh);
    else hits.delete(userId);
  }
}, WINDOW_MS).unref();

module.exports = { chatRateLimit };
