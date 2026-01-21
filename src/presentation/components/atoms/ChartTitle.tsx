import { AppText } from "./AppText";

// Props del componente ChartTitle
interface Props {
  // Texto que se mostrará como título
  children: string;
}

// Componente para mostrar títulos en gráficos
export function ChartTitle({ children }: Props) {
  return (
    <AppText
      // Estilos específicos para el título del gráfico
      style={{
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
      }}
    >
      {children}
    </AppText>
  );
}
