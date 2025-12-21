import { View } from "react-native";
import { BudgetItem } from "../molecules/BudgetItem";
import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { useBudgetTreeViewModel } from "../../../presentation/viewmodels/BudgetTreeViewModel";

type Props = {
  nodes: BudgetNode[];
  level?: number;
};

export const BudgetTree = ({ nodes, level = 0 }: Props) => {
  const { totalsMap } = useBudgetTreeViewModel(nodes);

  return (
    <>
      {nodes.map((node) => (
        <View key={node.id}>
          <View style={{ paddingLeft: level * 16 }}>
            <BudgetItem
              name={node.name}
              total={totalsMap.get(node.id) ?? node.amount}
            />
          </View>

          {node.children.length > 0 && (
            <BudgetTree
              nodes={node.children}
              level={level + 1}
            />
          )}
        </View>
      ))}
    </>
  );
};
