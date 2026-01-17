import { View } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { AppText } from "../atoms/AppText";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { useMemo } from "react";

interface Props {
  data: PieData[];
}

export function BudgetPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <AppText style={{ opacity: 0.5, marginVertical: 16 }}>
        No hay datos para mostrar la gráfica
      </AppText>
    );
  }

  // 🔑 clave animación
  const chartKey = useMemo(
    () => data.map((d) => `${d.key}-${d.value}`).join("|"),
    [data]
  );

  const pieData = data.map((item) => ({
    value: item.value,
    svg: { fill: item.color },
    key: item.key,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <View style={{ marginVertical: 20 }}>
      <AppText style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        Distribución del presupuesto
      </AppText>

      <PieChart
        key={chartKey}     // 🔥 anima al cambiar
        style={{ height: 220 }}
        data={pieData}
        animate
        animationDuration={500}
        innerRadius={40}
        padAngle={0.02}
      />

      {/* 📌 LEYENDAS */}
      <View style={{ marginTop: 12 }}>
        {data.map((d) => {
          const percent = ((d.value / total) * 100).toFixed(1);

          return (
            <View
              key={d.key}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: d.color,
                  marginRight: 8,
                }}
              />
              <AppText>
                {d.label}: ${d.value} ({percent}%)
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
