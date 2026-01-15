import { View } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { ChartTitle } from "../atoms/ChartTitle";
import { PieChartLegend } from "../molecules/PieChartLegend";

interface Props {
  data: PieData[];
}

export function BudgetPieChart({ data }: Props) {
  if (data.length === 0) return null;

  const pieData = data.map((item) => ({
    value: item.value,
    svg: { fill: item.color },
    key: item.key,
  }));

  return (
    <View style={{ marginVertical: 16 }}>
      <ChartTitle>Distribución del presupuesto</ChartTitle>

      <PieChart
        style={{ height: 220 }}
        data={pieData}
        innerRadius={30}
        padAngle={0.02}
      />

      <PieChartLegend data={data} />
    </View>
  );
}
