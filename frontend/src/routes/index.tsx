import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MedicalBackdrop } from "@/components/MedicalBackdrop";
import { roleDashboards, roleMeta, roleStyle, type Role } from "@/lib/nexora";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora — Your Healthcare Intelligence" },
      {
        name: "description",
        content:
          "Sign in to Nexora as a doctor, patient or administrator and get a workspace tuned to your role.",
      },
      { property: "og:title", content: "Nexora — Your Healthcare Intelligence" },
      {
        property: "og:description",
        content: "Role-aware healthcare intelligence for doctors, patients and administrators.",
      },
    ],
  }),
  component: NexoraApp,
});

type Screen = "role" | "login" | "register" | "forgot" | "app";

function Header() {
  return (
    <header className="relative z-10 flex items-center justify-center px-6 pt-10">
      <h1 className="text-center text-2xl font-extrabold sm:text-3xl">
        <span className="text-gradient">Nexora</span>
        <span className="text-foreground/85"> - Your Heathcare Intelligence</span>
      </h1>
    </header>
  );
}

function RoleSelect({ onPick }: { onPick: (r: Role) => void }) {
  const roles = Object.keys(roleMeta) as Role[];
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16">
      <p className="text-center text-sm uppercase tracking-[0.3em] text-accent">Choose your access</p>



      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => onPick(r)}
            className="group surface-card rounded-2xl p-6 text-left transition-transform duration-200 hover:-translate-y-1.5 hover:border-primary/60"
          >
            <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow">
              {roleMeta[r].accent}
            </span>
            <h3 className="mt-5 text-xl font-bold">{roleMeta[r].label}</h3>
            <p className="mt-1 text-sm font-semibold text-accent">{roleMeta[r].tagline}</p>
            <p className="mt-3 text-sm text-muted-foreground">{roleMeta[r].blurb}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors group-hover:text-primary-glow">
              Continue →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input className="field-input" {...props} />
    </label>
  );
}

function AuthShell({
  role,
  title,
  subtitle,
  children,
  onBack,
}: {
  role: Role;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-md px-6 py-14">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-muted-foreground transition-colors hover:text-accent"
      >
        ← Change role
      </button>
      <div className="surface-card rounded-2xl p-7">
        <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
          {roleMeta[role].label} access
        </span>
        <h2 className="mt-4 text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </section>
  );
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        6-digit code
      </span>
      <input
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="······"
        className="field-input text-center text-2xl tracking-[0.6em]"
      />
    </div>
  );
}

function NexoraApp() {
  const [screen, setScreen] = useState<Screen>("role");
  const [role, setRole] = useState<Role>("patient");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");

  const data = useMemo(() => roleDashboards[role], [role]);

  const reset = () => {
    setOtp("");
    setSentOtp(null);
    setError(null);
    setNotice(null);
    setStep("email");
  };

  const sendOtp = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter the email registered with Nexora.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentOtp(code);
    setError(null);
    setStep("otp");
    setNotice(`A verification code was sent to ${email}. Demo code: ${code}`);
  };

  const verifyOtp = (next: "reset" | "app") => {
    if (otp !== sentOtp) {
      setError("That code doesn't match. Try again or resend.");
      return;
    }
    setError(null);
    if (next === "reset") {
      setStep("reset");
      setNotice("Identity verified. Choose a new password.");
    } else {
      setScreen("app");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <MedicalBackdrop />
      <Header />

      {screen === "role" && (
        <RoleSelect
          onPick={(r) => {
            setRole(r);
            reset();
            setScreen("login");
          }}
        />
      )}

      {screen === "login" && (
        <AuthShell
          role={role}
          title="Sign in"
          subtitle={`Secure ${roleMeta[role].label.toLowerCase()} access to ${roleMeta[role].tagline.toLowerCase()}.`}
          onBack={() => {
            reset();
            setScreen("role");
          }}
        >
          <Field
            label="Work email"
            type="email"
            placeholder="you@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            className="btn-amethyst w-full rounded-lg px-4 py-2.5 text-sm font-bold"
            onClick={() => {
              if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
                setError("Enter a valid email and a password of 6+ characters.");
                return;
              }
              setError(null);
              setScreen("app");
            }}
          >
            Enter Nexora
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              className="text-muted-foreground transition-colors hover:text-accent"
              onClick={() => {
                reset();
                setScreen("forgot");
              }}
            >
              Forgot password?
            </button>
            <button
              className="font-semibold text-primary-glow hover:underline"
              onClick={() => {
                reset();
                setScreen("register");
              }}
            >
              Create account
            </button>
          </div>
        </AuthShell>
      )}

      {screen === "register" && (
        <AuthShell
          role={role}
          title="Create your account"
          subtitle="We'll verify your email with a one-time code before activation."
          onBack={() => {
            reset();
            setScreen("role");
          }}
        >
          {step === "email" ? (
            <>
              <Field
                label="Full name"
                placeholder="Dr. Ananya Rao"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Field
                label="Email"
                type="email"
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                className="btn-amethyst w-full rounded-lg px-4 py-2.5 text-sm font-bold"
                onClick={() => {
                  if (!name.trim() || password.length < 6) {
                    setError("Add your name and a password of 6+ characters.");
                    return;
                  }
                  sendOtp();
                }}
              >
                Send verification code
              </button>
            </>
          ) : (
            <>
              {notice && <p className="text-sm text-accent">{notice}</p>}
              <OtpBoxes value={otp} onChange={setOtp} />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                className="btn-amethyst w-full rounded-lg px-4 py-2.5 text-sm font-bold"
                onClick={() => verifyOtp("app")}
              >
                Verify & activate
              </button>
              <button
                className="w-full text-sm text-muted-foreground transition-colors hover:text-accent"
                onClick={sendOtp}
              >
                Resend code
              </button>
            </>
          )}
          <button
            className="w-full text-sm text-primary-glow hover:underline"
            onClick={() => {
              reset();
              setScreen("login");
            }}
          >
            I already have an account
          </button>
        </AuthShell>
      )}

      {screen === "forgot" && (
        <AuthShell
          role={role}
          title="Reset password"
          subtitle="We'll email a one-time code to your registered address."
          onBack={() => {
            reset();
            setScreen("login");
          }}
        >
          {step === "email" && (
            <>
              <Field
                label="Registered email"
                type="email"
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                className="btn-amethyst w-full rounded-lg px-4 py-2.5 text-sm font-bold"
                onClick={sendOtp}
              >
                Send OTP
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              {notice && <p className="text-sm text-accent">{notice}</p>}
              <OtpBoxes value={otp} onChange={setOtp} />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                className="btn-amethyst w-full rounded-lg px-4 py-2.5 text-sm font-bold"
                onClick={() => verifyOtp("reset")}
              >
                Verify code
              </button>
              <button
                className="w-full text-sm text-muted-foreground transition-colors hover:text-accent"
                onClick={sendOtp}
              >
                Resend code
              </button>
            </>
          )}

          {step === "reset" && (
            <>
              {notice && <p className="text-sm text-accent">{notice}</p>}
              <Field
                label="New password"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                className="btn-amethyst w-full rounded-lg px-4 py-2.5 text-sm font-bold"
                onClick={() => {
                  if (newPassword.length < 6) {
                    setError("Password must be at least 6 characters.");
                    return;
                  }
                  setPassword(newPassword);
                  reset();
                  setScreen("login");
                }}
              >
                Save password & sign in
              </button>
            </>
          )}
        </AuthShell>
      )}

      {screen === "app" && (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12">
          <div className={roleStyle[role].shell}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={roleStyle[role].eyebrow}>
                {roleMeta[role].tagline}
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Welcome back{name ? `, ${name.split(" ")[0]}` : ""}
              </h2>
              <p className="mt-1 text-muted-foreground">{data.greeting}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:border-accent/60 hover:text-accent"
                onClick={() => {
                  reset();
                  setScreen("role");
                }}
              >
                Switch role
              </button>
              <button
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:border-destructive/60 hover:text-destructive"
                onClick={() => {
                  reset();
                  setScreen("login");
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          <div className={`mt-8 ${roleStyle[role].statGrid}`}>
            {data.stats.map((s) => (
              <div key={s.label} className={roleStyle[role].statCard}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className={roleStyle[role].statValue}>{s.value}</p>
                <p className="mt-1 text-xs text-accent">{s.delta}</p>
              </div>
            ))}
          </div>

          <div className={roleStyle[role].panelGrid}>
            {data.panels.map((panel) => (
              <div key={panel.title} className={roleStyle[role].panel}>
                <h3 className="text-lg font-bold">{panel.title}</h3>
                <ul className="mt-4 space-y-3">
                  {panel.items.map((item) => (
                    <li key={item.primary} className={roleStyle[role].item}>
                      <div>
                        <p className="text-sm font-semibold">{item.primary}</p>
                        <p className="text-xs text-muted-foreground">{item.secondary}</p>
                      </div>
                      <span className={roleStyle[role].tag}>{item.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {data.actions.map((a) => (
              <button
                key={a}
                className={
                  role === "admin"
                    ? "rounded-md border border-border bg-secondary/60 px-5 py-2 text-sm font-semibold text-foreground/85 transition-colors hover:border-warning/60 hover:text-warning"
                    : role === "patient"
                      ? "rounded-full border border-accent/50 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                      : "btn-amethyst rounded-lg px-5 py-2 text-sm font-semibold"
                }
              >
                {a}
              </button>
            ))}
          </div>
          </div>
        </section>
      )}

    </main>
  );
}
