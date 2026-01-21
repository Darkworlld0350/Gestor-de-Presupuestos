import React, { useMemo, useState } from "react";
import HomeScreen from "../presentation/screens/HomeScreen";
import HistoryScreen from "../presentation/screens/HistoryScreen";

export type RouteName = "Home" | "History";

export type NavigationProps = {
  route: RouteName;
  navigate: (to: RouteName) => void;
  goBack: () => void;

  // ✅ opcional pero MUY útil
  refreshHome: () => void;
};

type StackItem = { route: RouteName; key: string };

// ✅ key fuerte (web + mobile) para re-mount REAL
const genKey = () =>
  `${Date.now()}_${Math.random().toString(16).slice(2)}_${Math.random()
    .toString(16)
    .slice(2)}`;

export default function AppNavigation() {
  const [stack, setStack] = useState<StackItem[]>([
    { route: "Home", key: genKey() },
  ]);

  const current = stack[stack.length - 1] ?? { route: "Home", key: genKey() };

  const refreshHome = () => {
    setStack((prev) => {
      const next = [...prev];
      // busca el último Home en el stack y le cambia la key
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].route === "Home") {
          next[i] = { route: "Home", key: genKey() };
          break;
        }
      }
      return next;
    });
  };

  const navigate = (to: RouteName) => {
    setStack((prev) => [...prev, { route: to, key: genKey() }]);
  };

  const goBack = () => {
    setStack((prev) => {
      if (prev.length <= 1) return prev;

      const next = prev.slice(0, -1);

      // ✅ al volver desde History, forzamos re-mount de Home SIEMPRE
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].route === "Home") {
          next[i] = { route: "Home", key: genKey() };
          break;
        }
      }

      return next;
    });
  };

  const navigation: NavigationProps = useMemo(
    () => ({
      route: current.route,
      navigate,
      goBack,
      refreshHome,
    }),
    [current.route]
  );

  // ✅ render según ruta
  if (current.route === "History") {
    return <HistoryScreen key={current.key} navigation={navigation} />;
  }

  return <HomeScreen key={current.key} navigation={navigation} />;
}
