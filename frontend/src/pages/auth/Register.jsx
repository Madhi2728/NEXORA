import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/common/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import RoleSelector, { ALL_ROLES } from "../../components/common/RoleSelector";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mirror the backend policy so users get feedback before the round-trip.
  const passwordError =
    form.password.length > 0 && form.password.length < 8
      ? "Password must be at least 8 characters."
      : form.password.length >= 8 &&
          !(/[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password))
        ? "Password must include at least one letter and one number."
        : "";

  const registerRoles = ALL_ROLES.map((r) =>
    r.value === "admin"
      ? {
          ...r,
          disabled: true,
          disabledNote: "Created by an existing admin, not here",
        }
      : r,
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setSubmitting(true);
    try {
      const { email } = await register(
        form.name,
        form.email,
        form.password,
        form.role,
      );
      // No session yet — the account exists but must verify its email first.
      navigate(
        `/verify-email?email=${encodeURIComponent(email || form.email)}`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h3 className="text-2xl font-bold text-foreground">
        Create your account
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin accounts are created by an existing admin, not here.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            placeholder="Dr. Anita Rao"
            className="h-11 bg-background/50"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
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
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p
            className={`text-xs ${passwordError ? "text-destructive" : "text-muted-foreground"}`}
          >
            {passwordError ||
              "At least 8 characters, with one letter and one number."}
          </p>
        </div>
        <div className="space-y-2">
          <Label>I am a</Label>
          <RoleSelector
            roles={registerRoles}
            value={form.role}
            onChange={(role) => setForm({ ...form, role })}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || !!passwordError}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Register & verify email
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
