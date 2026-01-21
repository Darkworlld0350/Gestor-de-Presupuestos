import { View } from "react-native";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { LegendItem } from "../atoms/LegendItem";

// Props del componente PieChartLegend
interface Props {
  // Datos del gráfico de pastel
  data: PieData[];
}

// Componente que renderiza la leyenda del gráfico de pastel
export function PieChartLegend({ data }: Props) {
  return (
    <View style={{ marginTop: 8 }}>
      {/* Renderiza un item de leyenda por cada segmento del gráfico */}
      {data.map((item) => (
        <LegendItem
          key={item.key}
          color={item.color}
          label={item.label}
          value={item.value}
        />
      ))}
    </View>
  );
}
