import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/common/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import RoleSelector, { ALL_ROLES } from "../../components/common/RoleSelector";

const ROLE_HOME = { admin: "/admin", doctor: "/doctor", patient: "/patient" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const registerRoles = ALL_ROLES.map((r) =>
    r.value === "admin"
      ? { ...r, disabled: true, disabledNote: "Created by an existing admin, not here" }
      : r
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border border-white/50 p-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Create your account</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Admin accounts are created by an existing admin, not here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <input
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <PasswordInput
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">I am a</label>
            <RoleSelector
              roles={registerRoles}
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-semibold transition shadow-lg shadow-violet-600/20"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
