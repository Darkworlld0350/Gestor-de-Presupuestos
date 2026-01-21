import { Alert, Platform } from "react-native";

// Muestra un diálogo de confirmación cross-platform y retorna true/false
export function confirmDialog(opts: {
  title: string;        // Título del diálogo
  message: string;      // Mensaje a mostrar
  confirmText?: string; // Texto del botón de confirmación
  cancelText?: string;  // Texto del botón de cancelar
}): Promise<boolean> {
  // Valores por defecto para los botones
  const confirmText = opts.confirmText ?? "Aceptar";
  const cancelText = opts.cancelText ?? "Cancelar";

  //  WEB: usa confirm del navegador (siempre disponible)
  if (Platform.OS === "web") {
    const ok = window.confirm(`${opts.title}\n\n${opts.message}`);
    return Promise.resolve(ok);
  }

  //  MOBILE: usa Alert.alert con botones (envuelto en Promise)
  return new Promise((resolve) => {
    Alert.alert(opts.title, opts.message, [
      // Botón cancelar => false
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      // Botón confirmar => true (destructive para acciones sensibles)
      { text: confirmText, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

// Muestra un diálogo informativo cross-platform (sin confirmación)
export function infoDialog(title: string, message: string) {
  //  WEB: alert del navegador
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  //  MOBILE: Alert.alert nativo
  Alert.alert(title, message);
}
