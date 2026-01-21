import { BudgetNode } from "../entities/BudgetNode";
import { BudgetStorage } from "../../data/storage/BudgetStorage";

// Caso de uso encargado de guardar el presupuesto actual
export class SaveBudgetUseCase {
  // Inyecta el storage responsable de la persistencia
  constructor(private storage: BudgetStorage) {}

  // Ejecuta el guardado del árbol de presupuesto
  async execute(tree: BudgetNode) {
    await this.storage.save(tree);
  }
}
