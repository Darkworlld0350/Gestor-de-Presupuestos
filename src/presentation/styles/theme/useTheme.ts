import { useColorScheme } from "react-native";

// Modos de tema soportados por la aplicación
export type ThemeMode = "auto" | "light" | "dark";

// Resuelve el modo final de tema según la preferencia del usuario
// Si es "auto", usa el esquema del sistema
export function resolveMode(
  mode: ThemeMode,
  system: "light" | "dark"
) {
  return mode === "auto" ? system : mode;
}

// Retorna el set de colores según el modo resuelto (light / dark)
export function getThemeColors(resolved: "light" | "dark") {
  const isDark = resolved === "dark";

  return {
    // Indica si el tema activo es oscuro
    isDark,

    /* ---------- superficies ---------- */
    // Fondo principal de la app
    bg: isDark ? "#0b1220" : "#ffffff",
    // Fondo de tarjetas y contenedores
    card: isDark ? "#0f1b2d" : "#ffffff",
    // Color de bordes y separadores
    border: isDark ? "#20314a" : "#e5e7eb",

    /* ---------- texto ---------- */
    // Color principal del texto
    text: isDark ? "#e5e7eb" : "#111827",
    // Color de texto secundario o atenuado
    textMuted: isDark
      ? "rgba(229,231,235,0.75)"
      : "rgba(17,24,39,0.7)",

    /* ---------- inputs ---------- */
    // Fondo de inputs
    inputBg: isDark ? "#0f1b2d" : "#ffffff",
    // Borde de inputs
    inputBorder: isDark ? "#20314a" : "#e5e7eb",
    // Color del placeholder
    placeholder: isDark
      ? "rgba(229,231,235,0.45)"
      : "rgba(17,24,39,0.35)",

    /* ---------- acciones ---------- */
    // Color primario para botones y acciones principales
    primary: "#2563eb",
    // Color para acciones destructivas
    danger: "#dc2626",
    // Color neutral para acciones secundarias
    neutral: isDark ? "#111827" : "#111827",

    /* ---------- estados ---------- */
    // Estado correcto / guardado exitoso
    ok: "#10b981",
    // Estado de advertencia
    warn: "#f59e0b",
  };
}

// Hook que obtiene el esquema de color del sistema
// Retorna "light" por defecto si no está disponible
export function useSystemScheme(): "light" | "dark" {
  return (useColorScheme() ?? "light") as "light" | "dark";
}
