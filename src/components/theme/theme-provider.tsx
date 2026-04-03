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

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  // Read from the data-mode attribute set by the inline script in layout.tsx
  const mode = document.documentElement.getAttribute("data-mode");
  if (mode === "light" || mode === "dark") return mode;
  const stored = localStorage.getItem("ml-theme") as Theme | null;
  return stored === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Read the real theme on mount (client-side only)
    const stored = localStorage.getItem("ml-theme") as Theme | null;
    const real = stored === "light" ? "light" : "dark";
    setThemeState(real);
    applyTheme(real);
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
