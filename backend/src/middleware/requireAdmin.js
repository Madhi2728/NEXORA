// Gate for /api/admin/* routes. Must run AFTER verifyToken (which populates
// req.user = { id, role } from the Bearer JWT). This is just a role check —
// it deliberately reuses the existing auth scheme rather than adding a new one.
//
// Equivalent to requireRole("admin") from authMiddleware.js; kept as its own
// file because the spec calls for a dedicated middleware and it reads clearly
// at the route definition.
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { requireAdmin };
