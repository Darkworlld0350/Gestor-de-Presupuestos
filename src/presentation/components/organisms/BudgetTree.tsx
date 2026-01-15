import { View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { BudgetItem } from "../molecules/BudgetItem";
import { CalculateTotalUseCase } from "../../../domain/usecases/CalculateTotalUseCase";
import { AppText } from "../atoms/AppText";

interface Props {
  node: BudgetNode;
  level?: number;
  onAmountChange: (id: string, value: number) => void;
  onNameChange: (id: string, name: string) => void;
  onAddChild: (id: string) => void;
  onSelect?: (id: string) => void; 
}

const calc = new CalculateTotalUseCase();

export function BudgetTree({
  node,
  level = 0,
  onAmountChange,
  onNameChange,
  onAddChild,
  onSelect,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const isLeaf = node.children.length === 0;
  const total = calc.execute(node);

  return (
    <View style={{ marginLeft: level * 16 }}>
      {/* HEADER */}
      <TouchableOpacity
        onPress={() => {
          onSelect?.(node.id);      // SELECCIONA PARA LA GRÁFICA
          if (!isLeaf) setCollapsed(!collapsed);
        }}
      >
        <BudgetItem
          name={node.name}
          amount={isLeaf ? node.amount : total}
          isLeaf={isLeaf}
          collapsed={collapsed}
          onNameChange={(v) => onNameChange(node.id, v)}
          onAmountChange={(v) => onAmountChange(node.id, v)}
        />
      </TouchableOpacity>

      {/* ADD CHILD */}
      <TouchableOpacity onPress={() => onAddChild(node.id)}>
        <AppText style={{ color: "#2563eb", marginVertical: 4 }}>
          ➕ Añadir subcategoría
        </AppText>
      </TouchableOpacity>

      {/* CHILDREN */}
      {!collapsed &&
        node.children.map((child) => (
          <BudgetTree
            key={child.id}
            node={child}
            level={level + 1}
            onAmountChange={onAmountChange}
            onNameChange={onNameChange}
            onAddChild={onAddChild}
            onSelect={onSelect}   // PROPAGADO
          />
        ))}
    </View>
  );
}
