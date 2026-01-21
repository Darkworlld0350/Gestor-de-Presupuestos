// Entidad de dominio que representa un nodo del presupuesto
export interface BudgetNode {
  // Identificador único del nodo
  id: string;

  // Nombre o categoría del presupuesto
  name: string;

  // Monto asignado al nodo
  amount: number;

  // Lista de nodos hijos que dependen de este nodo
  // Permite construir una estructura jerárquica
  children: BudgetNode[];
}
