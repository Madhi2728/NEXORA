const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT sent in the Authorization header (Bearer token).
 * Attaches the decoded payload ({ id, role }) to req.user.
 */
function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * Restricts a route to one or more roles.
 * Usage: requireRole("admin") or requireRole("admin", "doctor")
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied for this role." });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
