import { BudgetNode } from "../entities/BudgetNode";
import { colorFromIndex } from "../../presentation/utils/colorFromId";

// Estructura de datos usada por el gráfico de pastel
export interface PieData {
  // Identificador único del segmento
  key: string;
  // Valor numérico que representa el segmento
  value: number;
  // Etiqueta visible en el gráfico
  label: string;
  // Color asignado al segmento
  color: string;
  // Porcentaje que representa respecto al total
  percent: number;
}

// Caso de uso encargado de generar los datos para el gráfico de pastel
export class GetPieChartDataUseCase {
  // Genera los datos del pie chart a partir de un nodo padre
  execute(node: BudgetNode): PieData[] {
    // Si no hay hijos, no hay datos para el gráfico
    if (!node.children || node.children.length === 0) return [];

    // Calcula el total de cada hijo
    const totals = node.children.map((c) => this.calculate(c));

    // Calcula el total general
    const grandTotal = totals.reduce((a, b) => a + b, 0);

    // Construye los segmentos del gráfico
    return node.children
      .map((child, index) => {
        const value = totals[index];

        return {
          key: child.id,
          label: child.name,
          value,
          // Calcula el porcentaje respecto al total general
          percent: grandTotal
            ? Math.round((value / grandTotal) * 100)
            : 0,
          // Asigna un color según la posición
          color: colorFromIndex(index),
        };
      })
      // Elimina segmentos con valor cero
      .filter((d) => d.value > 0);
  }

  // Calcula recursivamente el total de un nodo
  private calculate(node: BudgetNode): number {
    // Nodo hoja: retorna su monto
    if (node.children.length === 0) return node.amount;

    // Nodo padre: suma su monto y el total de sus hijos
    return node.children.reduce(
      (sum, c) => sum + this.calculate(c),
      node.amount
    );
  }
}
