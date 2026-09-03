const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const RequestMetric = require("../models/RequestMetric");
const ChatEvent = require("../models/ChatEvent");
const { getProviderStatus } = require("../config/openaiClient");
const { getCacheStats } = require("../config/rxnormClient");

function p95(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[Math.max(0, idx)];
}

function hourlySeries(rows, hours = 24) {
  const series = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const byHour = new Map();
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const key = d.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    byHour.set(key, { hour: d.toISOString(), requests: 0, errors_5xx: 0 });
  }
  for (const r of rows) {
    const key = new Date(r.created_at).toISOString().slice(0, 13);
    const bucket = byHour.get(key);
    if (!bucket) continue;
    bucket.requests += 1;
    if (r.status_code >= 500) bucket.errors_5xx += 1;
  }
  for (const v of byHour.values()) series.push(v);
  return series;
}

// GET /api/admin/system-health
async function getSystemHealth(req, res) {
  try {
    // --- DB latency (SELECT 1) ---
    const db = { connected: false, latency_ms: null };
    try {
      const t0 = Date.now();
      await sequelize.query("SELECT 1");
      db.latency_ms = Date.now() - t0;
      db.connected = true;
    } catch {
      db.connected = false;
    }

    // --- API metrics, last 24h ---
    const since = new Date(Date.now() - 24 * 3600000);
    const metrics = await RequestMetric.findAll({
      where: { created_at: { [Op.gte]: since } },
      attributes: ["status_code", "duration_ms", "created_at"],
      raw: true,
    });

    const error_4xx = metrics.filter((m) => m.status_code >= 400 && m.status_code < 500).length;
    const error_5xx = metrics.filter((m) => m.status_code >= 500).length;

    const api = {
      requests_24h: metrics.length,
      error_4xx,
      error_5xx,
      p95_latency_ms: p95(metrics.map((m) => m.duration_ms)),
      series: hourlySeries(metrics, 24),
    };

    // --- AI providers (last known, no live call) ---
    const status = getProviderStatus();
    const fallback_count_24h = await ChatEvent.count({
      where: { type: "provider_fallback", created_at: { [Op.gte]: since } },
    });
    const ai = {
      openai_ok: status.openai.configured ? status.openai.ok : false,
      openai_configured: status.openai.configured,
      openai_checked_at: status.openai.at,
      groq_ok: status.groq.configured ? status.groq.ok : false,
      groq_configured: status.groq.configured,
      groq_checked_at: status.groq.at,
      fallback_count_24h,
    };

    // --- Cache + process ---
    const mem = process.memoryUsage();
    return res.json({
      db,
      api,
      ai,
      cache: { rxnorm_terms: getCacheStats().terms },
      process: {
        uptime_seconds: Math.round(process.uptime()),
        node_version: process.version,
        memory_mb: Math.round(mem.rss / (1024 * 1024)),
      },
    });
  } catch (err) {
    console.error("admin getSystemHealth failed:", err);
    return res.status(500).json({ message: "Could not load system health." });
  }
}

module.exports = { getSystemHealth };
