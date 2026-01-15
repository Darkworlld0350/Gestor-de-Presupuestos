import { View } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { AppText } from "../atoms/AppText";

interface Props {
  data: PieData[];
}

export function BudgetPieChart({ data }: Props) {
  if (data.length === 0) return null;

  const pieData = data.map((item) => ({
    value: item.value,
    svg: { fill: item.color },
    key: item.key,
    arc: { cornerRadius: 6 },
  }));

  return (
    <View style={{ marginVertical: 24 }}>
      <AppText style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
        Distribución del presupuesto
      </AppText>

      <PieChart
        style={{ height: 220 }}
        data={pieData}
        innerRadius={40}
        animate
        animationDuration={400}
      />

      {data.map((d) => (
        <AppText key={d.key}>
          ● {d.label}: ${d.value}
        </AppText>
      ))}
    </View>
  );
}
