import React, { useState } from "react";
import HomeScreen from "../presentation/screens/HomeScreen";
import HistoryScreen from "../presentation/screens/HistoryScreen";

// Nombres de rutas disponibles en la aplicación
export type RouteName = "Home" | "History";

// Props de navegación que se inyectan a cada pantalla
export type NavigationProps = {
  // Ruta actual
  route: RouteName;
  // Navega a una nueva ruta
  navigate: (to: RouteName) => void;
  // Regresa a la pantalla anterior
  goBack: () => void;
};

// Elemento interno del stack de navegación
type StackItem = {
  // Nombre de la ruta
  route: RouteName;
  // Key usada para forzar re-render / re-mount
  key: number;
};

// Navegación simple basada en stack (sin librerías externas)
export default function AppNavigation() {
  // Stack de navegación, inicia en Home
  const [stack, setStack] = useState<StackItem[]>([
    { route: "Home", key: 1 },
  ]);

  // Obtiene la ruta actual (último elemento del stack)
  const current = stack[stack.length - 1] ?? { route: "Home", key: 1 };

  // Agrega una nueva ruta al stack
  const navigate = (to: RouteName) =>
    setStack((prev) => [...prev, { route: to, key: Date.now() }]);

  // Regresa a la ruta anterior
  const goBack = () =>
    setStack((prev) => {
      // Evita eliminar la última pantalla
      if (prev.length <= 1) return prev;

      // Elimina la ruta actual
      const next = prev.slice(0, -1);

      // Si regresamos a Home, se fuerza el re-mount
      // para recargar el presupuesto restaurado
      const last = next[next.length - 1];
      if (last?.route === "Home") {
        next[next.length - 1] = { route: "Home", key: Date.now() };
      }

      return next;
    });

  // Objeto de navegación que se pasa a las pantallas
  const navigation: NavigationProps = {
    route: current.route,
    navigate,
    goBack,
  };

  // Renderiza la pantalla según la ruta actual
  if (current.route === "History") {
    return <HistoryScreen navigation={navigation} />;
  }

  return <HomeScreen key={current.key} navigation={navigation} />;
}
