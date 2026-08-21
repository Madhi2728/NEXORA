import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle — Nexora
 * -----------------------------------------------------------------------
 * A single self-contained file with:
 *   1. ThemeProvider  – wrap your app once (e.g. in main.jsx or App.jsx)
 *   2. useTheme       – hook to read/set theme anywhere
 *   3. ThemeToggle    – the sun/moon icon button, drop into any navbar/header
 *
 * Requires: tailwind.config.js -> darkMode: 'class'
 * -----------------------------------------------------------------------
 */

// ---------- 1. Context ----------
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("nexora-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("nexora-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------- 2. Hook ----------
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

// ---------- 3. Toggle button ----------
export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center justify-center
        h-10 w-10 rounded-full
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        focus:outline-none focus-visible:ring-2
        focus-visible:ring-purple-400 dark:focus-visible:ring-teal-400
        group
        ${className}
      `}
    >
      {/* glow behind icon, purple in light mode / teal in dark mode */}
      <span
        className="
          absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-br from-purple-400/30 to-teal-400/30
          dark:from-teal-400/20 dark:to-purple-400/20
          blur-md
        "
      />
      <span className="relative h-5 w-5">
        <Sun
          className={`
            absolute inset-0 h-5 w-5 text-amber-500
            transition-all duration-500 ease-out
            ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}
          `}
        />
        <Moon
          className={`
            absolute inset-0 h-5 w-5 text-teal-300
            transition-all duration-500 ease-out
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}
          `}
        />
      </span>
    </button>
  );
}

export default ThemeToggle;
