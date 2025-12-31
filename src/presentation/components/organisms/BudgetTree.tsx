import { View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { BudgetItem } from "../molecules/BudgetItem";
import { AppText } from "../atoms/AppText";

interface Props {
  node: BudgetNode;
  level?: number;
  onAmountChange: (id: string, v: number) => void;
  onNameChange: (id: string, name: string) => void;
  onAddChild: (id: string) => void;
}

export function BudgetTree({
  node,
  level = 0,
  onAmountChange,
  onNameChange,
  onAddChild,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const isLeaf = node.children.length === 0;

  return (
    <View style={{ marginLeft: level * 16 }}>
      <TouchableOpacity
        disabled={isLeaf}
        onPress={() => setCollapsed(!collapsed)}
      >
        <BudgetItem
          name={node.name}
          amount={node.amount}
          isLeaf={isLeaf}
          onNameChange={(n) => onNameChange(node.id, n)}
          onAmountChange={(v) => onAmountChange(node.id, v)}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onAddChild(node.id)}>
        <AppText>➕ Añadir subcategoría</AppText>
      </TouchableOpacity>

      {!collapsed &&
        node.children.map((c) => (
          <BudgetTree
            key={c.id}
            node={c}
            level={level + 1}
            onAmountChange={onAmountChange}
            onNameChange={onNameChange}
            onAddChild={onAddChild}
          />
        ))}
    </View>
  );
}
