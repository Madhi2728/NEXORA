import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordRequest } from "../../services/authService";
import AuthLayout from "../../components/common/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    otp: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await resetPasswordRequest(form.email, form.otp, form.newPassword);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border border-white/50 p-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Reset password</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Enter the 6-digit code we emailed you, along with your new password.
        </p>

        {done ? (
          <p className="text-sm text-violet-700 bg-violet-50 rounded-lg p-3">
            Password updated! Redirecting you to sign in...
          </p>
        ) : (
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                6-digit code
              </label>
              <input
                required
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest text-center font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
                placeholder="000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New password
              </label>
              <PasswordInput
                required
                minLength={6}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-semibold transition shadow-lg shadow-violet-600/20"
            >
              {submitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <p className="text-sm text-slate-500 mt-6 text-center">
          <Link to="/login" className="text-violet-600 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
