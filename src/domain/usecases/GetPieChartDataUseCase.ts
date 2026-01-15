import { BudgetNode } from "../entities/BudgetNode";

export interface PieData {
  key: string;
  value: number;
  label: string;
  color: string;
}

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#7c3aed"];

export class GetPieChartDataUseCase {
  execute(node: BudgetNode): PieData[] {
    if (!node.children || node.children.length === 0) return [];

    return node.children
      .map((child, index) => {
        const total = this.calculate(child);

        return {
          key: child.id,
          label: child.name,
          value: total,
          color: COLORS[index % COLORS.length],
        };
      })
      .filter((item) => item.value > 0); // 🔑 CLAVE
  }

  private calculate(node: BudgetNode): number {
    if (node.children.length === 0) return node.amount;
    return node.children.reduce(
      (sum, c) => sum + this.calculate(c),
      node.amount
    );
  }
}
