import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("nexora-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark"; // your app's default look
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // styles.css defines dark as the base :root theme, with a ".light"
    // override block for light mode -- so we only ever toggle "light".
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("nexora-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a ThemeProvider");
  return ctx;
}
