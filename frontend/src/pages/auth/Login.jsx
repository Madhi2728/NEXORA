import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/common/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import RoleSelector from "../../components/common/RoleSelector";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const ROLE_HOME = { admin: "/admin", doctor: "/doctor", patient: "/patient" };
const ROLE_LABEL = { admin: "Admin", doctor: "Doctor", patient: "Patient" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");
  // Carried over from the password-reset flow ("Password updated. Sign in…").
  const [notice, setNotice] = useState(location.state?.notice || "");
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
          `This account is registered as ${ROLE_LABEL[user.role]}, not ${ROLE_LABEL[selectedRole]}. Signing you in to the correct dashboard.`,
        );
      }

      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      // Password was right but the email is unverified — send them to verify.
      if (
        err.response?.status === 403 &&
        err.response.data?.code === "EMAIL_NOT_VERIFIED"
      ) {
        const email = err.response.data.email || form.email;
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h3 className="text-2xl font-bold text-foreground">Sign in</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back to Nexora Health.
      </p>

      <div className="mt-6 space-y-2">
        <Label>Select your role</Label>
        <RoleSelector value={selectedRole} onChange={setSelectedRole} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Registered email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@clinic.org"
            className="h-11 bg-background/50"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-signal">{notice}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
