import { useMemo } from "react";
import { BudgetNode } from "../../domain/entities/BudgetNode";
import { CalculateTotalUseCase } from "../../domain/usecases/CalculateTotalUseCase";

const calculator = new CalculateTotalUseCase();

export const useBudgetTreeViewModel = (nodes: BudgetNode[]) => {
  const totalsMap = useMemo(() => {
    const map = new Map<string, number>();

    const calculate = (node: BudgetNode): number => {
      const total =
        node.amount +
        node.children.reduce((sum, c) => sum + calculate(c), 0);

      map.set(node.id, total);
      return total;
    };

    nodes.forEach(calculate);
    return map;
  }, [nodes]);

  return { totalsMap };
};
