import { BudgetNode } from "../entities/BudgetNode";

// Contrato del repositorio de presupuesto dentro de la capa de dominio
export interface BudgetRepository {
  // Guarda el árbol completo de presupuestos
  save(tree: BudgetNode[]): Promise<void>;

  // Carga el árbol completo de presupuestos
  load(): Promise<BudgetNode[]>;
}
