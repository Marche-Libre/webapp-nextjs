"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", t === "dark" ? "marchelibre" : "marchelibre-light");
  html.setAttribute("data-mode", t);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("ml-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const setTheme = (next: Theme) => {
    const html = document.documentElement;
    html.classList.add("theme-transitioning");

    setThemeState(next);
    localStorage.setItem("ml-theme", next);
    applyTheme(next);

    setTimeout(() => html.classList.remove("theme-transitioning"), 600);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
