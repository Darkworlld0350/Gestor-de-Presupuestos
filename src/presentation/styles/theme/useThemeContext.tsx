import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import type { ReactNode } from "react";

/* ---------------- TYPES ---------------- */
// Modos de tema soportados por la app
export type ThemeMode = "auto" | "light" | "dark";

// Forma (shape) de los colores disponibles en el tema
type ThemeColors = {
  isDark: boolean;   // indica si el tema resuelto es oscuro
  bg: string;        // fondo principal
  card: string;      // fondo de tarjetas/controles
  border: string;    // color de bordes
  text: string;      // texto principal
  textMuted: string; // texto secundario/atenuado
  primary: string;   // color primario (acciones)
  danger: string;    // color para acciones destructivas
  neutral: string;   // color neutral (acciones secundarias)
  ok: string;        // color para estado correcto/éxito
  warn: string;      // color para advertencia
};

// Valores expuestos por el contexto de tema
type ThemeContextValue = {
  mode: ThemeMode;                    // modo seleccionado por el usuario
  setMode: (m: ThemeMode) => void;    // setter del modo
  resolved: "light" | "dark";         // modo final aplicado (tras resolver "auto")
  colors: ThemeColors;                // paleta de colores calculada
};

/* ---------------- CONTEXT ---------------- */
// Contexto que almacenará el tema (inicia en null hasta que exista Provider)
const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ---------------- COLOR PALETTE ---------------- */
// Genera la paleta de colores según el modo resuelto
function getColors(resolved: "light" | "dark"): ThemeColors {
  const isDark = resolved === "dark";

  return {
    isDark,
    // superficies
    bg: isDark ? "#0b1220" : "#ffffff",
    card: isDark ? "#111827" : "#f9fafb",
    border: isDark ? "#1f2937" : "#e5e7eb",

    // texto
    text: isDark ? "#f9fafb" : "#111827",
    textMuted: isDark ? "#cbd5e1" : "#4b5563",

    // acciones (mismo primary para ambos)
    primary: "#2563eb",
    danger: "#dc2626",
    neutral: isDark ? "#374151" : "#111827",

    // estados
    ok: "#10b981",
    warn: "#f59e0b",
  };
}

/* ---------------- MODE RESOLVER ---------------- */
/**
 * Resuelve el modo final a partir del modo elegido y el esquema del sistema.
 * system puede venir como: "light" | "dark" | null | undefined
 */
function resolveMode(
  mode: ThemeMode,
  system: "light" | "dark" | null | undefined
): "light" | "dark" {
  // Forzado explícito por el usuario
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";

  // Modo auto: usa el sistema; si no hay valor, cae a "light"
  return system === "dark" ? "dark" : "light";
}

/* ---------------- PROVIDER ---------------- */
// Provider que envuelve la app y provee el tema a todos los componentes hijos
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Detecta el esquema del sistema (puede ser null/undefined)
  const systemScheme = useColorScheme();
  // Modo elegido por el usuario (por defecto auto)
  const [mode, setMode] = useState<ThemeMode>("auto");

  // Modo final aplicado (light/dark)
  const resolved = resolveMode(mode, systemScheme);

  // Calcula colores solo cuando cambia "resolved"
  const colors = useMemo(() => getColors(resolved), [resolved]);

  // Memoriza el objeto de contexto para evitar renders innecesarios
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
    // Provee el contexto a todo el árbol de componentes
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */
// Hook para consumir el contexto de tema desde cualquier componente
export function useThemeContext() {
  const ctx = useContext(ThemeContext);

  // Protege contra uso fuera del ThemeProvider
  if (!ctx) {
    throw new Error("useThemeContext must be used inside ThemeProvider");
  }

  return ctx;
}
