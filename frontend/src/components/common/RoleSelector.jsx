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
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}>
      {roles.map(({ value: v, label, icon: Icon, desc, disabled, disabledNote }) => {
        const selected = value === v;
        return (
          <div key={v}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(v)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                disabled
                  ? "border-border/60 bg-muted/40 opacity-60 cursor-not-allowed"
                  : selected
                    ? "border-primary bg-primary/15"
                    : "border-border/60 bg-background/40 hover:border-primary/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  disabled
                    ? "bg-muted text-muted-foreground"
                    : selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon size={16} />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </button>
            {disabled && disabledNote && (
              <p className="text-[11px] text-muted-foreground mt-1 px-1">{disabledNote}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
