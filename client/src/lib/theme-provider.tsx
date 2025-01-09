import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) return saved;
    // Otherwise check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "system";
    }
    return "light";
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem("fontSize") as FontSize) || "medium";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.fontSize = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }[fontSize];
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
