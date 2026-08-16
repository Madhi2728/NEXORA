/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Sora"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Nexora auth theme (ported from the Lovable design) — used by the
        // shadcn/ui primitives in components/ui and the auth pages/layout.
        // Most tokens use Tailwind's <alpha-value> placeholder so opacity
        // modifiers like `bg-primary/15` work against the oklch CSS vars in
        // index.css. `input` is a fixed-alpha passthrough (see index.css).
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: "oklch(var(--card) / <alpha-value>)",
        "card-foreground": "oklch(var(--card-foreground) / <alpha-value>)",
        popover: "oklch(var(--popover) / <alpha-value>)",
        "popover-foreground": "oklch(var(--popover-foreground) / <alpha-value>)",
        primary: "oklch(var(--primary) / <alpha-value>)",
        "primary-foreground": "oklch(var(--primary-foreground) / <alpha-value>)",
        secondary: "oklch(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "oklch(var(--secondary-foreground) / <alpha-value>)",
        muted: "oklch(var(--muted) / <alpha-value>)",
        "muted-foreground": "oklch(var(--muted-foreground) / <alpha-value>)",
        accent: "oklch(var(--accent) / <alpha-value>)",
        "accent-foreground": "oklch(var(--accent-foreground) / <alpha-value>)",
        destructive: "oklch(var(--destructive) / <alpha-value>)",
        "destructive-foreground": "oklch(var(--destructive-foreground) / <alpha-value>)",
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        amethyst: "oklch(var(--amethyst) / <alpha-value>)",
        lavender: "oklch(var(--lavender) / <alpha-value>)",
        vitality: "oklch(var(--vitality) / <alpha-value>)",
        signal: "oklch(var(--signal) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
