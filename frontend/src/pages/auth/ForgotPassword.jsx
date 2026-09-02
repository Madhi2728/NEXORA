import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Loader2, ShieldCheck, MailCheck } from "lucide-react";
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  resendOtpRequest,
} from "../../services/authService";
import { useOtpCountdown } from "../../hooks/useOtpCountdown";
import AuthLayout from "../../components/common/AuthLayout";
import OtpInput from "../../components/common/OtpInput";
import PasswordInput from "../../components/common/PasswordInput";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const RESEND_COOLDOWN = 60;

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// One page, three local-state steps:  email  ->  otp  ->  new password.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState(params.get("email") ? "otp" : "email");
  const [email, setEmail] = useState(params.get("email") || "");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { secondsLeft, restart } = useOtpCountdown(RESEND_COOLDOWN);

  async function sendCode(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setNotice(
        "If an account with that email exists, a reset code has been sent. Check your inbox and spam folder.",
      );
      restart();
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function submitOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setNotice("");
    setStep("password");
  }

  async function handleResend() {
    setError("");
    setNotice("");
    setResending(true);
    try {
      await resendOtpRequest(email, "password_reset");
      setNotice("A fresh code is on its way.");
      restart();
    } catch (err) {
      const secs = err.response?.data?.secondsRemaining;
      if (err.response?.status === 429 && secs) {
        restart(secs);
        setError(`Please wait ${fmt(secs)} before requesting another code.`);
      } else {
        setError(err.response?.data?.message || "Could not send a new code.");
      }
    } finally {
      setResending(false);
    }
  }

  async function setNewPassword(e) {
    e.preventDefault();
    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pw !== confirmPw) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await resetPasswordRequest(email, otp, pw);
      navigate("/login", {
        replace: true,
        state: { notice: "Password updated. Sign in with your new password." },
      });
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || "Could not reset password.";
      if (data?.attemptsRemaining != null) {
        msg += ` ${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} left.`;
      }
      setError(msg);
      // A rejected code sends them back to re-enter it.
      if (err.response?.status === 400 || err.response?.status === 429) {
        setOtp("");
        setStep("otp");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h3 className="text-2xl font-bold text-foreground">
        Reset your password
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {step === "email" &&
          "Enter your email and we'll send you a 6-digit code."}
        {step === "otp" && "Enter the 6-digit code we emailed you."}
        {step === "password" && "Choose a new password for your account."}
      </p>

      {step === "email" && (
        <form onSubmit={sendCode} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fp-email">Registered email</Label>
            <Input
              id="fp-email"
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
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Email me a reset code
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="mt-7 space-y-5">
          <p className="text-xs text-muted-foreground">
            Code sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} autoFocus />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-signal">{notice}</p>}

          <Button type="submit" className="w-full">
            <ShieldCheck className="h-4 w-4" />
            Continue
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn't get it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={secondsLeft > 0 || resending}
              className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
            >
              {resending ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Sending…
                </span>
              ) : secondsLeft > 0 ? (
                `Resend in ${fmt(secondsLeft)}`
              ) : (
                <span className="inline-flex items-center gap-1">
                  <MailCheck className="h-3.5 w-3.5" /> Resend code
                </span>
              )}
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={setNewPassword} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fp-new">New password</Label>
            <PasswordInput
              id="fp-new"
              required
              minLength={6}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fp-confirm">Confirm new password</Label>
            <PasswordInput
              id="fp-confirm"
              required
              minLength={6}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
            {confirmPw && pw !== confirmPw && (
              <p className="text-xs text-destructive">Passwords don't match.</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Reset password
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
