import { BudgetNode } from "../entities/BudgetNode";
import { BudgetStorage } from "../../data/storage/BudgetStorage";

// Caso de uso encargado de cargar el presupuesto almacenado
export class LoadBudgetUseCase {
  // Inyecta el storage responsable de la persistencia
  constructor(private storage: BudgetStorage) {}

  // Ejecuta la carga del presupuesto actual
  // Retorna el presupuesto o null si no existe
  async execute(): Promise<BudgetNode | null> {
    return await this.storage.load();
  }
}
