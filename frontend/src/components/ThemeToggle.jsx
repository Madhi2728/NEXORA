import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Small sun/moon toggle for switching light/dark theme.
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${
        isDark
          ? "bg-slate-800 border-slate-700 text-yellow-300 hover:bg-slate-700"
          : "bg-white border-slate-200 text-violet-600 hover:bg-slate-50"
      } ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
