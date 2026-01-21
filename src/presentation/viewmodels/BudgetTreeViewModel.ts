import { useMemo } from "react";
import { BudgetNode } from "../../domain/entities/BudgetNode";
import { CalculateTotalUseCase } from "../../domain/usecases/CalculateTotalUseCase";

// Instancia del caso de uso para calcular totales
const calculator = new CalculateTotalUseCase();

// ViewModel que prepara datos derivados del árbol de presupuesto para la vista
export const useBudgetTreeViewModel = (nodes: BudgetNode[]) => {
  // Memoriza un mapa de totales por id para evitar recálculos innecesarios
  const totalsMap = useMemo(() => {
    // Mapa id -> total calculado
    const map = new Map<string, number>();

    // Calcula recursivamente el total de un nodo y sus hijos
    const calculate = (node: BudgetNode): number => {
      // Total = monto propio + suma de totales de hijos
      const total =
        node.amount +
        node.children.reduce((sum, c) => sum + calculate(c), 0);

      // Guarda el total en el mapa
      map.set(node.id, total);
      return total;
    };

    // Calcula totales para cada nodo raíz
    nodes.forEach(calculate);
    return map;
  }, [nodes]);

  // Expone el mapa de totales para consumo en la UI
  return { totalsMap };
};
