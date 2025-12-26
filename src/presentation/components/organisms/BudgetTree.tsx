import { View, StyleSheet } from "react-native";
import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { BudgetItem } from "../molecules/BudgetItem";
import { CalculateTotalUseCase } from "../../../domain/usecases/CalculateTotalUseCase";

interface Props {
  node: BudgetNode;
  level?: number;
  onAmountChange: (id: string, value: number) => void;
}

const calculateTotalUseCase = new CalculateTotalUseCase();

export function BudgetTree({
  node,
  level = 0,
  onAmountChange,
}: Props) {
  const isLeaf = node.children.length === 0;
  const total = calculateTotalUseCase.execute(node);

  return (
    <View style={styles.row}>
      {/* Línea vertical */}
      {level > 0 && (
        <View style={[styles.line, { left: level * 16 - 8 }]} />
      )}

      <View style={{ marginLeft: level * 16 }}>
        <BudgetItem
          name={node.name}
          total={isLeaf ? node.amount : total} // 🔑 CLAVE
          isLeaf={isLeaf}
          onChange={(value) => onAmountChange(node.id, value)}
        />

        {node.children.map((child) => (
          <BudgetTree
            key={child.id}
            node={child}
            level={level + 1}
            onAmountChange={onAmountChange}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#ccc",
  },
});
