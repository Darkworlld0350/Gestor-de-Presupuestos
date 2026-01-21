import { View, TextInput, TouchableOpacity } from "react-native";
import { AppText } from "../atoms/AppText";
import { budgetStyles } from "../../styles/budgetStyles";
import { useThemeContext } from "../../styles/theme/useThemeContext";

// Props del componente BudgetItem
interface Props {
  // Nombre o categoría del presupuesto
  name: string;
  // Monto del nodo (editable si es hoja)
  amount: number;
  // Indica si el nodo es hoja
  isLeaf: boolean;
  // Indica si el nodo está colapsado (solo para nodos padre)
  collapsed?: boolean;

  // Callback al cambiar el nombre
  onNameChange: (v: string) => void;
  // Callback al cambiar el monto
  onAmountChange: (v: number) => void;

  // Callback opcional para eliminar el nodo
  onDelete?: () => void;
}

// Componente que representa un nodo del árbol de presupuesto
export function BudgetItem({
  name,
  amount,
  isLeaf,
  collapsed,
  onNameChange,
  onAmountChange,
  onDelete,
}: Props) {
  // Obtiene los colores del tema actual
  const { colors } = useThemeContext();

  return (
    <View
      // Contenedor principal del item
      style={[
        budgetStyles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      {/* Campo editable para el nombre de la categoría */}
      <TextInput
        value={name}
        onChangeText={onNameChange}
        placeholder="Categoría"
        placeholderTextColor={colors.textMuted}
        style={[
          budgetStyles.nameInput,
          {
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

      {/* Monto editable si es hoja, total calculado si es nodo padre */}
      {isLeaf ? (
        <TextInput
          value={String(amount)}
          keyboardType="numeric"
          onChangeText={(t) => onAmountChange(Number(t) || 0)}
          placeholder="$0"
          placeholderTextColor={colors.textMuted}
          style={[
            budgetStyles.amountInput,
            {
              color: colors.text,
              borderColor: colors.primary,
            },
          ]}
        />
      ) : (
        <AppText style={[budgetStyles.total, { color: colors.text }]}>
          ${amount}{" "}
          {/* Indicador visual de colapsado / expandido */}
          <AppText style={[budgetStyles.arrow, { color: colors.textMuted }]}>
            {collapsed ? "▶" : "▼"}
          </AppText>
        </AppText>
      )}

      {/* Botón para eliminar el nodo */}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={{ marginLeft: 10 }}>
          <AppText style={{ color: colors.danger, fontWeight: "900" }}>
            🗑
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}
