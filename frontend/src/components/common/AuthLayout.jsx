import { ShieldCheck } from "lucide-react";
import { AmbientBackground } from "../nexora/AmbientBackground";
import { BrandHeader } from "../nexora/BrandHeader";
import { EcgPulse } from "../nexora/EcgPulse";

const HIGHLIGHTS = [
  "Secure, role-based access for every account",
  "Real-time vitals and prescription tracking",
  "Built for patients, doctors, and admins alike",
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen font-nexora-sans text-foreground">
      <AmbientBackground />
      <BrandHeader />

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_1fr] lg:px-10">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Healthcare intelligence
          </p>
          <h2 className="mt-4 font-display text-5xl font-extrabold leading-tight xl:text-6xl">
            <span className="text-gradient">Nexora</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Your health, connected in one place — vitals, prescriptions, and your care team, all
            in a single secure workspace.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 max-w-md">
            <EcgPulse />
            <p className="mt-2 text-xs text-muted-foreground">Tap the line for a pulse.</p>
          </div>
        </section>

        <section className="glass-panel w-full rounded-3xl p-7 animate-fade-in sm:p-9">
          {children}
        </section>
      </main>
    </div>
  );
}
