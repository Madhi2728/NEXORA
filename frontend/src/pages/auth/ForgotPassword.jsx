import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { forgotPasswordRequest } from "../../services/authService";
import AuthLayout from "../../components/common/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

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
      <h3 className="text-2xl font-semibold text-foreground">Reset your password</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send you a 6-digit code to reset your password.
      </p>

      {sent ? (
        <div className="mt-7 space-y-4">
          <p className="flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-sm text-accent">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            If an account with that email exists, a reset code has been sent. Check your inbox
            (and spam folder).
          </p>
          <Button
            className="w-full"
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
          >
            I have my code
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Registered email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@clinic.org"
              className="h-11 bg-background/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Email me a reset code
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
