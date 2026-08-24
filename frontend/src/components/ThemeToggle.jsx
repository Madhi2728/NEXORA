import React from "react";
import { Sun, Moon, Sparkle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * ThemeToggle – Nexora
 * ------------------------------------------------------------
 * Pill-shaped switch with a circular thumb that slides between
 * a sun icon (light mode) and a moon icon (dark mode).
 *
 * Reads/writes theme state from the single ThemeContext
 * (src/context/ThemeContext.jsx) — this file no longer defines
 * its own ThemeProvider/ThemeContext, so the whole dashboard and
 * this switch always stay in sync.
 *
 * Drop <ThemeToggle /> into any navbar/header.
 * ------------------------------------------------------------
 */
export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative inline-flex h-9 w-16 shrink-0 items-center
        rounded-full border
        bg-slate-800 border-slate-700
        dark:bg-slate-800 dark:border-slate-700
        transition-colors duration-300 ease-out
        hover:border-slate-600
        focus:outline-none focus-visible:ring-2
        focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        focus-visible:ring-purple-400
        ${className}
      `}
    >
      {/* subtle track glow */}
      <span
        className="
          pointer-events-none absolute inset-0 rounded-full
          bg-gradient-to-r from-slate-800/80 to-slate-900/80
        "
      />

      {/* sliding thumb */}
      <span
        className={`
          relative z-10 flex h-7 w-7 items-center justify-center
          rounded-full shadow-md
          bg-slate-600
          transition-transform duration-300 ease-out
          ${isDark ? "translate-x-[30px]" : "translate-x-1"}
        `}
      >
        {isDark ? (
          <span className="relative flex items-center justify-center">
            <Moon className="h-4 w-4 text-white" fill="currentColor" strokeWidth={0} />
            <Sparkle
              className="absolute -right-1.5 -top-1.5 h-2 w-2 text-white"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        ) : (
          <Sun className="h-4 w-4 text-white" fill="currentColor" strokeWidth={0} />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
