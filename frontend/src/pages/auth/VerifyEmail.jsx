import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { resendOtpRequest } from "../../services/authService";
import { useOtpCountdown } from "../../hooks/useOtpCountdown";
import AuthLayout from "../../components/common/AuthLayout";
import OtpInput from "../../components/common/OtpInput";
import { Button } from "../../components/ui/button";

const ROLE_HOME = { admin: "/admin", doctor: "/doctor", patient: "/patient" };
const RESEND_COOLDOWN = 60;

function maskEmail(email) {
  const [name = "", domain = ""] = String(email).split("@");
  if (!domain) return email;
  const shown = name.slice(0, 1);
  return `${shown}${"*".repeat(Math.max(1, name.length - 1))}@${domain}`;
}

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [params] = useSearchParams();
  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState("");
  const { secondsLeft, restart } = useOtpCountdown(RESEND_COOLDOWN);

  // No email in the URL means the user landed here directly — send them back.
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const user = await verifyEmail(email, otp);
      navigate(ROLE_HOME[user.role] || "/", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || "That code is incorrect or has expired.";
      if (data?.attemptsRemaining != null) {
        msg += ` ${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} left.`;
      }
      setError(msg);
      setOtp("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setNotice("");
    setResending(true);
    try {
      await resendOtpRequest(email, "signup_verification");
      setNotice(
        "A fresh code is on its way. Check your inbox and spam folder.",
      );
      restart();
    } catch (err) {
      const secs = err.response?.data?.secondsRemaining;
      if (err.response?.status === 429 && secs) {
        restart(secs);
        setError(`Please wait ${fmt(secs)} before requesting another code.`);
      } else {
        setError(
          err.response?.data?.message ||
            "Could not send a new code. Try again shortly.",
        );
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <h3 className="text-2xl font-bold text-foreground">Verify your email</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{maskEmail(email)}</span>.
        Enter it below to finish setting up your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <OtpInput
          value={otp}
          onChange={setOtp}
          disabled={submitting}
          autoFocus
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-signal">{notice}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Verify & continue
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

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Wrong address?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Start over
        </Link>
      </p>
    </AuthLayout>
  );
}
