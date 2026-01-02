import { View, TextInput } from "react-native";
import { AppText } from "../atoms/AppText";
import { budgetStyles } from "../../styles/budgetStyles";

interface Props {
  name: string;
  amount: number;
  isLeaf: boolean;
  collapsed?: boolean;
  onNameChange: (v: string) => void;
  onAmountChange: (v: number) => void;
}

export function BudgetItem({
  name,
  amount,
  isLeaf,
  collapsed,
  onNameChange,
  onAmountChange,
}: Props) {
  return (
    <View style={budgetStyles.row}>
      {/* Nombre */}
      <TextInput
        value={name}
        onChangeText={onNameChange}
        placeholder="Categoría"
        style={budgetStyles.nameInput}
      />

      {/* Monto o total */}
      {isLeaf ? (
        <TextInput
          value={String(amount)}
          keyboardType="numeric"
          onChangeText={(t) => onAmountChange(Number(t) || 0)}
          placeholder="$0"
          style={budgetStyles.amountInput}
        />
      ) : (
        <AppText style={budgetStyles.total}>
          ${amount}{" "}
          <AppText style={budgetStyles.arrow}>
            {collapsed ? "▶" : "▼"}
          </AppText>
        </AppText>
      )}
    </View>
  );
}
