import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordRequest } from "../../services/authService";
import AuthLayout from "../../components/common/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border border-white/50 p-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Forgot password</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Enter your email and we'll send you a 6-digit code to reset your password.
        </p>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-violet-700 bg-violet-50 rounded-lg p-3">
              If an account with that email exists, a reset code has been sent. Check your
              inbox (and spam folder).
            </p>
            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 font-medium transition"
            >
              I have my code
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-semibold transition shadow-lg shadow-violet-600/20"
            >
              {submitting ? "Sending..." : "Send reset code"}
            </button>
          </form>
        )}

        <p className="text-sm text-slate-500 mt-6 text-center">
          Remembered your password?{" "}
          <Link to="/login" className="text-violet-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
