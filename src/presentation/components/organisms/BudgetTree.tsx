import { View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { BudgetItem } from "../molecules/BudgetItem";
import { CalculateTotalUseCase } from "../../../domain/usecases/CalculateTotalUseCase";
import { AppText } from "../atoms/AppText";
import { budgetStyles } from "../../styles/budgetStyles";

const calc = new CalculateTotalUseCase();

interface Props {
  node: BudgetNode;
  level?: number;
  onAmountChange: (id: string, v: number) => void;
  onNameChange: (id: string, v: string) => void;
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
  const total = calc.execute(node);

  return (
    <View style={{ marginLeft: level * 16 }}>
      <TouchableOpacity onPress={() => !isLeaf && setCollapsed(!collapsed)}>
        <BudgetItem
          name={node.name}
          amount={isLeaf ? node.amount : total}
          isLeaf={isLeaf}
          collapsed={collapsed}
          onNameChange={(v) => onNameChange(node.id, v)}
          onAmountChange={(v) => onAmountChange(node.id, v)}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onAddChild(node.id)}>
        <AppText style={budgetStyles.addBtn}>
          ➕ Añadir subcategoría
        </AppText>
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
