import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";

import { BudgetNode } from "../../../domain/entities/BudgetNode";
import { CalculateTotalUseCase } from "../../../domain/usecases/CalculateTotalUseCase";

import { BudgetItem } from "../molecules/BudgetItemRow";
import { AppText } from "../atoms/AppText";
import { useThemeContext } from "../../styles/theme/useThemeContext";

// Props del componente BudgetTree
interface Props {
  // Nodo actual del árbol de presupuesto
  node: BudgetNode;
  // Nivel de profundidad en el árbol (para indentación)
  level?: number;

  // Callback para cambiar el monto de un nodo
  onAmountChange: (id: string, value: number) => void;
  // Callback para cambiar el nombre de un nodo
  onNameChange: (id: string, name: string) => void;
  // Callback para agregar un hijo a un nodo
  onAddChild: (id: string) => void;

  // Callback opcional para eliminar un nodo
  onDelete?: (id: string, label: string) => void;
}

// Caso de uso reutilizado para calcular totales
const calc = new CalculateTotalUseCase();

// Componente recursivo que renderiza el árbol de presupuestos
export function BudgetTree({
  node,
  level = 0,
  onAmountChange,
  onNameChange,
  onAddChild,
  onDelete,
}: Props) {
  // Colores del tema actual
  const { colors } = useThemeContext();

  // Estado para colapsar / expandir nodos padre
  const [collapsed, setCollapsed] = useState(false);

  // Hijos del nodo actual
  const children = node.children ?? [];

  // Determina si el nodo es hoja
  const isLeaf = children.length === 0;

  // Total calculado siempre para nodos padre
  const total = calc.execute(node);

  // Evita borrar el nodo raíz
  const canDelete = node.id !== "1";

  // Textos dinámicos según el nivel del nodo
  const isRoot = level === 0;
  const addLabel = isRoot ? "Categoría" : "Subcategoría";
  const addHint = isRoot
    ? "Agregar una categoría principal"
    : `Agregar dentro de “${node.name}”`;

  return (
    <View style={{ marginLeft: level * 16 }}>
      {/* Fila principal del nodo */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isLeaf}
        // Al presionar un nodo padre se colapsa / expande
        onPress={() => setCollapsed((p) => !p)}
      >
        <BudgetItem
          name={node.name}
          // Si es hoja se muestra su monto, si no el total calculado
          amount={isLeaf ? node.amount : total}
          isLeaf={isLeaf}
          // Indica visualmente si está colapsado
          collapsed={!isLeaf ? collapsed : undefined}
          onNameChange={(name) => onNameChange(node.id, name)}
          onAmountChange={(v) => onAmountChange(node.id, v)}
          // Habilita eliminar solo si no es raíz
          onDelete={
            canDelete && onDelete
              ? () => onDelete(node.id, node.name)
              : undefined
          }
        />
      </TouchableOpacity>

      {/* Botón para agregar una categoría o subcategoría */}
      <TouchableOpacity
        onPress={() => onAddChild(node.id)}
        activeOpacity={0.85}
        style={[
          styles.addRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Icono de agregar */}
        <AppText style={[styles.addIcon, { color: colors.primary }]}>
          ＋
        </AppText>

        {/* Texto descriptivo */}
        <View>
          <AppText style={[styles.addText, { color: colors.primary }]}>
            {addLabel}
          </AppText>
          <AppText style={[styles.addHint, { color: colors.textMuted }]}>
            {addHint}
          </AppText>
        </View>
      </TouchableOpacity>

      {/* Renderizado recursivo de los hijos */}
      {!collapsed &&
        children.map((c) => (
          <BudgetTree
            key={c.id}
            node={c}
            level={level + 1}
            onAmountChange={onAmountChange}
            onNameChange={onNameChange}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </View>
  );
}

// Estilos del botón para agregar nodos
const styles = StyleSheet.create({
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  addIcon: {
    fontSize: 18,
    fontWeight: "900",
    marginRight: 10,
    lineHeight: 18,
  },
  addText: {
    fontWeight: "900",
    fontSize: 14,
  },
  addHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
});
