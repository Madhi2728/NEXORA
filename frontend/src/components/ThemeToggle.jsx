import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 rounded-full flex items-center justify-center border transition"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        color: isDark ? "#fbbf24" : "var(--color-primary)",
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
