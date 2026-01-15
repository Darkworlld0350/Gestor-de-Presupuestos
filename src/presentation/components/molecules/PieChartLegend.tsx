import { View } from "react-native";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { LegendItem } from "../atoms/LegendItem";

interface Props {
  data: PieData[];
}

export function PieChartLegend({ data }: Props) {
  return (
    <View style={{ marginTop: 8 }}>
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
