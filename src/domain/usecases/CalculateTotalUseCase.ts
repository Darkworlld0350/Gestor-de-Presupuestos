import { BudgetNode } from "../entities/BudgetNode";

// Caso de uso encargado de calcular el total de un nodo del presupuesto
export class CalculateTotalUseCase {
  // Punto de entrada del caso de uso
  // Retorna el monto total calculado del nodo
  execute(node: BudgetNode): number {
    return this.sum(node);
  }

  // Suma recursivamente los montos del nodo y sus hijos
  private sum(node: BudgetNode): number {
    // Asegura que siempre exista un arreglo de hijos
    const children = node.children ?? [];

    // Nodo hoja: el monto es directamente editable
    if (children.length === 0) return Number(node.amount) || 0;

    // Nodo padre: el total es la suma de los montos de sus hijos
    return children.reduce((acc, c) => acc + this.sum(c), 0);
  }
}
