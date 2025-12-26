import { BudgetNode } from "../entities/BudgetNode";
import { BudgetStorage } from "../../data/storage/BudgetStorage";

export class SaveBudgetUseCase {
  constructor(private storage: BudgetStorage) {}

  async execute(tree: BudgetNode) {
    await this.storage.save(tree);
  }
}
