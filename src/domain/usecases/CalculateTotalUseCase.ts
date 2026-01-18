import { BudgetNode } from "../entities/BudgetNode";

export class CalculateTotalUseCase {
  execute(node: BudgetNode): number {
    return this.sum(node);
  }

  private sum(node: BudgetNode): number {
    const children = node.children ?? [];

    // hoja => el valor editable
    if (children.length === 0) return Number(node.amount) || 0;

    // padre => suma de hijos (y si quieres, también node.amount)
    return children.reduce((acc, c) => acc + this.sum(c), 0);
  }
}
