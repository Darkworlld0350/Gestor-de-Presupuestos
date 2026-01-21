// Modelo de datos que representa un nodo del presupuesto en la capa de persistencia
export interface BudgetModel {
  // Identificador único del nodo
  id: string;

  // Nombre o categoría del presupuesto
  name: string;

  // Monto asignado al nodo
  amount: number;

  // Lista de nodos hijos (estructura jerárquica del presupuesto)
  children: BudgetModel[];
}
