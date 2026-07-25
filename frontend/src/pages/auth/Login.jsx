import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/common/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import RoleSelector from "../../components/common/RoleSelector";

const ROLE_HOME = { admin: "/admin", doctor: "/doctor", patient: "/patient" };
const ROLE_LABEL = { admin: "Admin", doctor: "Doctor", patient: "Patient" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!selectedRole) {
      setError("Please select your role first.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);

      // Purely informational: the account's real role (from the backend)
      // always wins and determines where you're routed. If it doesn't match
      // what was picked here, we just let the person know why.
      if (user.role !== selectedRole) {
        setNotice(
          `This account is registered as ${ROLE_LABEL[user.role]}, not ${ROLE_LABEL[selectedRole]}. Signing you in to the correct dashboard.`
        );
      }

      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border border-white/50 p-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Welcome back</h1>
        <p className="text-slate-500 mb-6 text-sm">Sign in to your Nexora Health account</p>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select your role</label>
          <RoleSelector value={selectedRole} onChange={setSelectedRole} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-violet-600 font-medium">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-amber-600">{notice}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-semibold transition shadow-lg shadow-violet-600/20"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-violet-600 font-medium">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
