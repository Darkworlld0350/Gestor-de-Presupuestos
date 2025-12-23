import { BudgetNode } from "../entities/BudgetNode";

export function calculateBudgetTotals(node: BudgetNode): number {
  if (!node.children || node.children.length === 0) {
    return node.amount;
  }

  const total = node.children.reduce(
    (sum, child) => sum + calculateBudgetTotals(child),
    0
  );

  node.amount = total;
  return total;
}
