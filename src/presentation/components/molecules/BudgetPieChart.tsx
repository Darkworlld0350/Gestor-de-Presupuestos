import { View } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";
import { AppText } from "../atoms/AppText";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { useMemo } from "react";

interface Props {
  data: PieData[];
  onSelect?: (id: string) => void;
}

export function BudgetPieChart({ data, onSelect }: Props) {
  if (data.length === 0) {
    return (
      <AppText style={{ opacity: 0.5, marginVertical: 16 }}>
        No hay datos para mostrar la gráfica
      </AppText>
    );
  }

  const radius = 90;
  const innerRadius = 45;
  const cx = 100;
  const cy = 100;
  const total = data.reduce((s, d) => s + d.value, 0);

  // 🔑 fuerza re-render (animación simple por key)
  const chartKey = useMemo(
    () => data.map((d) => `${d.key}-${d.value}`).join("|"),
    [data]
  );

  let startAngle = 0;

  const polar = (angle: number, r: number) => {
    const a = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  };

  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      <AppText style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        Distribución del presupuesto
      </AppText>

      <Svg width={200} height={200} key={chartKey}>
        <G>
          {data.map((slice) => {
            const angle = (slice.value / total) * 360;
            const endAngle = startAngle + angle;

            const p1 = polar(startAngle, radius);
            const p2 = polar(endAngle, radius);
            const p3 = polar(endAngle, innerRadius);
            const p4 = polar(startAngle, innerRadius);

            const largeArc = angle > 180 ? 1 : 0;

            const d = `
              M ${p1.x} ${p1.y}
              A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}
              L ${p3.x} ${p3.y}
              A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${p4.x} ${p4.y}
              Z
            `;

            startAngle = endAngle;

            return (
              <Path
                key={slice.key}
                d={d}
                fill={slice.color}
                onPress={() => onSelect?.(slice.key)}
              />
            );
          })}
        </G>

        {/* centro */}
        <Circle cx={cx} cy={cy} r={innerRadius - 4} fill="#fff" />
      </Svg>

      {/* 📌 LEYENDAS */}
      <View style={{ marginTop: 12, width: "100%" }}>
        {data.map((d) => {
          const percent = ((d.value / total) * 100).toFixed(1);
          return (
            <View
              key={d.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
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
