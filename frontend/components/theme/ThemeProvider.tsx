"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  DEFAULT_THEME_COLOR,
  THEME_COLOR_STORAGE_KEY,
  isAppearanceMode,
  isThemeColor,
  type AppearanceMode,
  type ThemeColor,
} from "@/lib/theme/theme-colors";

type ThemeContextValue = {
  appearance: AppearanceMode;
  themeColor: ThemeColor;
  setAppearance: (appearance: AppearanceMode) => void;
  setThemeColor: (themeColor: ThemeColor) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredAppearance() {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (stored === "system") {
      return DEFAULT_APPEARANCE;
    }
    return isAppearanceMode(stored) ? stored : DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

function getStoredThemeColor() {
  if (typeof window === "undefined") return DEFAULT_THEME_COLOR;
  try {
    const stored = localStorage.getItem(THEME_COLOR_STORAGE_KEY);
    if (stored === "amber") {
      return DEFAULT_THEME_COLOR;
    }
    return isThemeColor(stored) ? stored : DEFAULT_THEME_COLOR;
  } catch {
    return DEFAULT_THEME_COLOR;
  }
}

function applyTheme(appearance: AppearanceMode, themeColor: ThemeColor) {
  const root = document.documentElement;
  const shouldUseDark = appearance === "dark";

  root.classList.toggle("dark", shouldUseDark);
  root.dataset.themeColor = themeColor;
  root.style.colorScheme = shouldUseDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceMode>(getStoredAppearance);
  const [themeColor, setThemeColorState] = useState<ThemeColor>(getStoredThemeColor);

  useEffect(() => {
    applyTheme(appearance, themeColor);
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
      localStorage.setItem(THEME_COLOR_STORAGE_KEY, themeColor);
    } catch {
      // Theme state should still work for the current session if storage is unavailable.
    }
  }, [appearance, themeColor]);

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        themeColor,
        setAppearance: setAppearanceState,
        setThemeColor: setThemeColorState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
