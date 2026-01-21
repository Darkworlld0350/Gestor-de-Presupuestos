import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useThemeContext } from "../../styles/theme/useThemeContext";

// Componente base de texto que aplica el tema global de la app
export function AppText(props: TextProps) {
  // Obtiene los colores del tema actual
  const { colors } = useThemeContext();

  return (
    <Text
      // Propaga todas las props originales de Text
      {...props}
      style={[
        // Estilo base del texto
        styles.base,
        // Color dinámico según el tema
        { color: colors.text },
        // Estilos personalizados pasados por props
        props.style,
      ]}
    />
  );
}

// Estilos base reutilizables para el texto
const styles = StyleSheet.create({
  base: {
    // Tamaño de fuente por defecto
    fontSize: 14,
  },
});
