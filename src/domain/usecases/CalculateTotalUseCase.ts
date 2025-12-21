import { BudgetNode } from "../entities/BudgetNode";

export class CalculateTotalUseCase {
  execute(node: BudgetNode): number {
    if (!node.children || node.children.length === 0) {
      return node.amount;
    }

    const childrenTotal = node.children.reduce(
      (sum, child) => sum + this.execute(child),
      0
    );

    return node.amount + childrenTotal;
  }
}
