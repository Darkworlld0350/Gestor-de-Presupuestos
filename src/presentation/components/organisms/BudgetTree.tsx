import { View } from "react-native";
import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { BudgetItem } from "../molecules/BudgetItem";
import { CalculateTotalUseCase } from "../../../domain/usecases/CalculateTotalUseCase";

interface Props {
  node: BudgetNode; // 👈 node, NO nodes
}

const calculateTotalUseCase = new CalculateTotalUseCase();

export function BudgetTree({ node }: Props) {
  const total = calculateTotalUseCase.execute(node);

  return (
    <View>
      <BudgetItem name={node.name} total={total} />

      {node.children?.map((child) => (
        <BudgetTree key={child.id} node={child} />
      ))}
    </View>
  );
}
