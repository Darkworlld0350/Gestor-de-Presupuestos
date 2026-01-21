import { View } from "react-native";
import { AppText } from "./AppText";

// Props del elemento de la leyenda
interface Props {
  // Color del indicador del gráfico
  color: string;
  // Etiqueta o nombre de la categoría
  label: string;
  // Valor numérico asociado a la categoría
  value: number;
}

// Componente que representa un elemento de la leyenda del gráfico
export function LegendItem({ color, label, value }: Props) {
  return (
    <View
      // Contenedor en fila para el punto de color y el texto
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}
    >
      {/* Punto de color que identifica la categoría */}
      <AppText style={{ color, marginRight: 6 }}>●</AppText>

      {/* Texto con la etiqueta y el valor */}
      <AppText>
        {label}: ${value}
      </AppText>
    </View>
  );
}
