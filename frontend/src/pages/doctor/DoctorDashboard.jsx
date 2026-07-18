import { useAuth } from "../../context/AuthContext";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Doctor Dashboard</h1>
        <button onClick={logout} className="text-sm text-red-600">
          Log out
        </button>
      </div>
      <p className="text-slate-600">
        Welcome, Dr. {user?.name}. Patient list, appointment calendar, and shared reports
        will appear here in later modules.
      </p>
    </div>
  );
}
