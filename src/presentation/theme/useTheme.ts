import { useColorScheme } from "react-native";

export type ThemeMode = "auto" | "light" | "dark";

export function resolveMode(mode: ThemeMode, system: "light" | "dark") {
  return mode === "auto" ? system : mode;
}

export function getThemeColors(resolved: "light" | "dark") {
  const isDark = resolved === "dark";

  return {
    isDark,

    // surfaces
    bg: isDark ? "#0b1220" : "#ffffff",
    card: isDark ? "#0f1b2d" : "#ffffff",
    border: isDark ? "#20314a" : "#e5e7eb",

    // text
    text: isDark ? "#e5e7eb" : "#111827",
    textMuted: isDark ? "rgba(229,231,235,0.75)" : "rgba(17,24,39,0.7)",

    // inputs
    inputBg: isDark ? "#0f1b2d" : "#ffffff",
    inputBorder: isDark ? "#20314a" : "#e5e7eb",
    placeholder: isDark ? "rgba(229,231,235,0.45)" : "rgba(17,24,39,0.35)",

    // actions
    primary: "#2563eb",
    danger: "#dc2626",
    neutral: isDark ? "#111827" : "#111827",

    // status
    ok: "#10b981",
    warn: "#f59e0b",
  };
}

export function useSystemScheme(): "light" | "dark" {
  return (useColorScheme() ?? "light") as "light" | "dark";
}
