import { BudgetNode } from "../../domain/entities/BudgetNode";
import { BudgetLocalDatasource } from "../datasources/BudgetLocalDatasource";
import { BudgetMapper } from "../mappers/BudgetMapper";

// Implementación del repositorio de presupuesto usando almacenamiento local
export class BudgetRepositoryImpl {
  // Inyecta el datasource encargado de la persistencia
  constructor(private datasource: BudgetLocalDatasource) {}

  // Guarda el presupuesto del dominio convirtiéndolo a JSON
  async save(budget: BudgetNode): Promise<void> {
    const json = BudgetMapper.toJson(budget);
    await this.datasource.save(json);
  }

  // Carga el presupuesto desde el almacenamiento local
  // Retorna null si no existe información guardada
  async load(): Promise<BudgetNode | null> {
    const json = await this.datasource.load();
    if (!json) return null;
    return BudgetMapper.fromJson(json);
  }

  // Elimina el presupuesto almacenado
  async clear(): Promise<void> {
    await this.datasource.clear();
  }
}
