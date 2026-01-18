import { View, StyleSheet, TouchableOpacity } from "react-native";
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
}

const calc = new CalculateTotalUseCase();

export function BudgetTree({
  node,
  level = 0,
  onAmountChange,
  onNameChange,
  onAddChild,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const children = node.children ?? [];
  const isLeaf = children.length === 0;

  // ✅ total SIEMPRE calculado
  const total = calc.execute(node);

  return (
    <View style={{ marginLeft: level * 16 }}>
      {/* Fila principal */}
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isLeaf}
        onPress={() => setCollapsed((p) => !p)}
      >
        <BudgetItem
          name={node.name}
          // ✅ hoja => amount editable | padre => total calculado
          amount={isLeaf ? node.amount : total}
          isLeaf={isLeaf}
          collapsed={!isLeaf ? collapsed : undefined}
          onNameChange={(name) => onNameChange(node.id, name)}
          onAmountChange={(v) => onAmountChange(node.id, v)}
        />
      </TouchableOpacity>

      {/* ✅ Botón “Añadir categoría” (SIEMPRE visible) */}
      <TouchableOpacity
        onPress={() => onAddChild(node.id)}
        activeOpacity={0.8}
        style={[styles.addRow, { marginLeft: level === 0 ? 0 : 6 }]}
      >
        <AppText style={styles.addIcon}>＋</AppText>
        <AppText style={styles.addText}>
          Añadir categoría
        </AppText>
      </TouchableOpacity>

      {/* Hijos */}
      {!collapsed &&
        children.map((c) => (
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

const styles = StyleSheet.create({
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
  },
  addIcon: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2563eb",
    marginRight: 6,
    lineHeight: 18,
  },
  addText: {
    color: "#2563eb",
    fontWeight: "700",
  },
});
