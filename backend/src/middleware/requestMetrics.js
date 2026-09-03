const RequestMetric = require("../models/RequestMetric");

// Records every /api/* request once the response is sent. Deliberately cheap:
//   - measures with hrtime, writes on the "finish" event (never blocks the response)
//   - fire-and-forget insert, errors swallowed
//   - skips the system-health endpoint itself to avoid a feedback loop
function requestMetrics(req, res, next) {
  const url = req.originalUrl || req.url || "";
  const path = url.split("?")[0];

  if (!path.startsWith("/api/") || path.startsWith("/api/admin/system-health")) {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    RequestMetric.create({
      route: path.slice(0, 255),
      method: req.method,
      status_code: res.statusCode,
      duration_ms: Math.round(durationMs),
    }).catch(() => {});
  });

  next();
}

module.exports = { requestMetrics };
