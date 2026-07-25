import { HeartPulse, ShieldCheck, Zap, Users } from "lucide-react";
import { useLightSweep } from "../../hooks/useLightSweep";

export default function AuthLayout({ children }) {
  const { style: lightStyle } = useLightSweep();

  return (
    <div className="min-h-screen flex overflow-hidden bg-white font-sans">
      {/* Left zone: calm, neutral, brand storytelling */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="dots" x="10" y="10" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="1.4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots)" className="text-violet-900" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          <div className="flex items-center gap-2 text-lg font-display font-bold text-slate-800">
            <HeartPulse className="text-violet-600" size={26} />
            Nexora Health
          </div>

          <div className="max-w-md animate-fade-in">
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 leading-tight">
              Your health, connected in one place.
            </h1>
            <p className="text-slate-600 text-lg mb-10">
              Track vitals, manage prescriptions, and stay in sync with your care team —
              all from a single, secure dashboard.
            </p>

            <div className="space-y-5">
              {[
                { icon: ShieldCheck, text: "Secure, role-based access for every account" },
                { icon: Zap, text: "Real-time vitals and prescription tracking" },
                { icon: Users, text: "Built for patients, doctors, and admins alike" },
              ].map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-violet-600" />
                  </div>
                  <span className="text-slate-700 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Nexora Health</p>
        </div>
      </div>

      {/* Right zone: vivid lavender gradient, houses the form, reacts to cursor */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 light-sweep"
        style={lightStyle}
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-sm px-4 py-12">{children}</div>
      </div>
    </div>
  );
}
