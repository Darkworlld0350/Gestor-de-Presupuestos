import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import type { ReactNode } from "react";

/* ---------------- TYPES ---------------- */
export type ThemeMode = "auto" | "light" | "dark";

type ThemeColors = {
  isDark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  danger: string;
  neutral: string;
  ok: string;
  warn: string;
};

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolved: "light" | "dark";
  colors: ThemeColors;
};

/* ---------------- CONTEXT ---------------- */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ---------------- COLOR PALETTE ---------------- */
function getColors(resolved: "light" | "dark"): ThemeColors {
  const isDark = resolved === "dark";

  return {
    isDark,
    bg: isDark ? "#0b1220" : "#ffffff",
    card: isDark ? "#111827" : "#f9fafb",
    border: isDark ? "#1f2937" : "#e5e7eb",
    text: isDark ? "#f9fafb" : "#111827",
    textMuted: isDark ? "#cbd5e1" : "#4b5563",
    primary: "#2563eb",
    danger: "#dc2626",
    neutral: isDark ? "#374151" : "#111827",
    ok: "#10b981",
    warn: "#f59e0b",
  };
}

/* ---------------- MODE RESOLVER ---------------- */
/**
 * system puede venir como:
 * "light" | "dark" | null | undefined
 */
function resolveMode(
  mode: ThemeMode,
  system: "light" | "dark" | null | undefined
): "light" | "dark" {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";

  // modo auto
  return system === "dark" ? "dark" : "light";
}

/* ---------------- PROVIDER ---------------- */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // puede ser undefined
  const [mode, setMode] = useState<ThemeMode>("auto");

  const resolved = resolveMode(mode, systemScheme);
  const colors = useMemo(() => getColors(resolved), [resolved]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      resolved,
      colors,
    }),
    [mode, resolved, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */
export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used inside ThemeProvider");
  }
  return ctx;
}
