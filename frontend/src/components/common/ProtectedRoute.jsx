import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Where each role belongs. Kept here (not just in Login.jsx) so a logged-in
// user who hits a route for the wrong role is bounced to their OWN dashboard
// rather than a dead-end "unauthorized" page.
export const ROLE_HOME = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
};

/**
 * Wrap any route element with this to require login, and optionally
 * restrict it to specific roles.
 *
 * <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/unauthorized"} replace />;
  }

  return children;
}
