// App.tsx
import React from "react";
import { ThemeProvider } from "./src/presentation/styles/theme/useThemeContext";
import AppNavigation from "./src/navigation/AppNavigation";

// Componente raíz de la aplicación
export default function App() {
  return (
    // Provee el contexto de tema (light / dark / auto) a toda la app
    <ThemeProvider>
      {/* Navegación principal de la aplicación */}
      <AppNavigation />
    </ThemeProvider>
  );
}
