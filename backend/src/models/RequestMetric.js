const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../config/db");

// One row per completed /api/* request. Written fire-and-forget by
// middleware/requestMetrics.js and pruned to a 7-day window so it can't grow
// unbounded. No FK — this is disposable telemetry, not business data.
const RequestMetric = sequelize.define(
  "RequestMetric",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    route: { type: DataTypes.STRING, allowNull: false },
    method: { type: DataTypes.STRING, allowNull: false },
    status_code: { type: DataTypes.INTEGER, allowNull: false },
    duration_ms: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "request_metrics",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const RETENTION_DAYS = 7;

RequestMetric.prune = async function prune() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  try {
    const removed = await RequestMetric.destroy({
      where: { created_at: { [Op.lt]: cutoff } },
    });
    if (removed) console.log(`RequestMetric: pruned ${removed} rows older than ${RETENTION_DAYS}d.`);
  } catch (err) {
    console.warn("RequestMetric.prune failed:", err.message);
  }
};

module.exports = RequestMetric;
