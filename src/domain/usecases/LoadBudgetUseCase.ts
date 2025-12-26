import { BudgetNode } from "../entities/BudgetNode";
import { BudgetStorage } from "../../data/storage/BudgetStorage";

export class LoadBudgetUseCase {
  constructor(private storage: BudgetStorage) {}

  async execute(): Promise<BudgetNode | null> {
    return await this.storage.load();
  }
}
