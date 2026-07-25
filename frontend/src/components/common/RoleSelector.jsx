import { Users, Stethoscope, ShieldCheck } from "lucide-react";

export const ALL_ROLES = [
  { value: "patient", label: "Patient", icon: Users, desc: "Manage your own health records" },
  { value: "doctor", label: "Doctor", icon: Stethoscope, desc: "Manage patient care" },
  { value: "admin", label: "Admin", icon: ShieldCheck, desc: "System administration" },
];

/**
 * roles: subset of ALL_ROLES to show, each optionally with `disabled: true`
 * and a `disabledNote` shown under the card when selected/hovered.
 */
export default function RoleSelector({ roles = ALL_ROLES, value, onChange }) {
  return (
    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}>
      {roles.map(({ value: v, label, icon: Icon, desc, disabled, disabledNote }) => {
        const selected = value === v;
        return (
          <div key={v}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(v)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                disabled
                  ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                  : selected
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-violet-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  disabled
                    ? "bg-slate-200 text-slate-400"
                    : selected
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={16} />
              </div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </button>
            {disabled && disabledNote && (
              <p className="text-[11px] text-slate-400 mt-1 px-1">{disabledNote}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
