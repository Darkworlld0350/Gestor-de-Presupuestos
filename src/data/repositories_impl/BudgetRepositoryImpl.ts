import { BudgetRepository } from "../../domain/repositories/BudgetRepository";
import { BudgetNode } from "../../domain/entities/BudgetNode";
import { BudgetLocalDatasource } from "../datasources/BudgetLocalDatasource";

export class BudgetRepositoryImpl implements BudgetRepository {
  constructor(private datasource: BudgetLocalDatasource) {}

  async save(tree: BudgetNode[]) {
    await this.datasource.save(JSON.stringify(tree));
  }

  async load(): Promise<BudgetNode[]> {
    const data = await this.datasource.load();
    return data ? JSON.parse(data) : [];
  }
}
