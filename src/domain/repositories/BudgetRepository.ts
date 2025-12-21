import { BudgetNode } from "../entities/BudgetNode";

export interface BudgetRepository {
  save(tree: BudgetNode[]): Promise<void>;
  load(): Promise<BudgetNode[]>;
}
