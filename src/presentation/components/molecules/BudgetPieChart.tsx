import { View } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";
import { AppText } from "../atoms/AppText";
import { PieData } from "../../../domain/usecases/GetPieChartDataUseCase";
import { useMemo } from "react";

// Props del componente BudgetPieChart
interface Props {
  // Datos del gráfico de pastel
  data: PieData[];
  // Callback opcional al seleccionar un segmento
  onSelect?: (id: string) => void;
  // Título del gráfico
  title?: string;
  // Color del centro del gráfico (útil para dark mode)
  centerColor?: string;
}

// Componente que renderiza un gráfico de pastel (donut)
export function BudgetPieChart({
  data,
  onSelect,
  title = "Distribución del presupuesto",
  centerColor = "#fff",
}: Props) {
  // Si no hay datos, muestra un mensaje informativo
  if (data.length === 0) {
    return (
      <AppText style={{ opacity: 0.6, marginVertical: 16 }}>
        No hay datos para mostrar la gráfica
      </AppText>
    );
  }

  // Configuración geométrica del gráfico
  const radius = 90;
  const innerRadius = 45;
  const cx = 100;
  const cy = 100;

  // Calcula el total de los valores del gráfico
  const total = useMemo(
    () => data.reduce((s, d) => s + d.value, 0),
    [data]
  );

  // Key dinámica para forzar re-render cuando cambian los valores
  const chartKey = useMemo(
    () => data.map((d) => `${d.key}-${d.value}`).join("|"),
    [data]
  );

  // Convierte un ángulo polar a coordenadas cartesianas
  const polar = (angle: number, r: number) => {
    const a = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  };

  // Si el total es 0, evita dibujar segmentos inválidos
  if (total <= 0) {
    return (
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <AppText style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
          {title}
        </AppText>
        <AppText style={{ opacity: 0.6 }}>
          Todos los montos son 0
        </AppText>
      </View>
    );
  }

  // Ángulo inicial para dibujar los segmentos
  let startAngle = 0;

  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      {/* Título del gráfico */}
      <AppText style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
        {title}
      </AppText>

      {/* SVG del gráfico de pastel */}
      <Svg width={200} height={200} key={chartKey}>
        <G>
          {data.map((slice) => {
            // Ángulo proporcional al valor del segmento
            const angle = (slice.value / total) * 360;
            const endAngle = startAngle + angle;

            // Puntos del arco exterior e interior
            const p1 = polar(startAngle, radius);
            const p2 = polar(endAngle, radius);
            const p3 = polar(endAngle, innerRadius);
            const p4 = polar(startAngle, innerRadius);

            // Determina si el arco es mayor a 180°
            const largeArc = angle > 180 ? 1 : 0;

            // Path SVG que define el segmento tipo donut
            const d = `
              M ${p1.x} ${p1.y}
              A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}
              L ${p3.x} ${p3.y}
              A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${p4.x} ${p4.y}
              Z
            `;

            // Actualiza el ángulo inicial para el siguiente segmento
            startAngle = endAngle;

            return (
              <Path
                key={slice.key}
                d={d}
                fill={slice.color}
                // Permite seleccionar el segmento
                onPress={() => onSelect?.(slice.key)}
              />
            );
          })}
        </G>

        {/* Círculo central del gráfico (donut) */}
        <Circle
          cx={cx}
          cy={cy}
          r={innerRadius - 4}
          fill={centerColor}
        />
      </Svg>

      {/* Leyenda del gráfico */}
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
              {/* Indicador de color */}
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: d.color,
                  marginRight: 8,
                }}
              />
              {/* Texto de la leyenda */}
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
