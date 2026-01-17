import { BudgetNode } from "../entities/BudgetNode";
import { colorFromIndex } from "../../presentation/utils/colorFromId";

export interface PieData {
  key: string;
  value: number;
  label: string;
  color: string;
  percent: number;
}

export class GetPieChartDataUseCase {
  execute(node: BudgetNode): PieData[] {
    if (!node.children || node.children.length === 0) return [];

    const totals = node.children.map((c) => this.calculate(c));
    const grandTotal = totals.reduce((a, b) => a + b, 0);

    return node.children.map((child, index) => {
      const value = totals[index];

      return {
        key: child.id,
        label: child.name,
        value,
        percent: grandTotal
          ? Math.round((value / grandTotal) * 100)
          : 0,
        color: colorFromIndex(index),
      };
    }).filter(d => d.value > 0);
  }

  private calculate(node: BudgetNode): number {
    if (node.children.length === 0) return node.amount;

    return node.children.reduce(
      (sum, c) => sum + this.calculate(c),
      node.amount
    );
  }
}
