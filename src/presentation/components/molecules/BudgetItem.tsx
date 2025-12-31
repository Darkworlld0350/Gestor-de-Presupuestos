import { View, TextInput, StyleSheet } from "react-native";
import { AppText } from "../atoms/AppText";

interface Props {
  name: string;
  amount: number;
  isLeaf: boolean;
  onAmountChange: (v: number) => void;
  onNameChange: (name: string) => void;
}

export function BudgetItem({
  name,
  amount,
  isLeaf,
  onAmountChange,
  onNameChange,
}: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        value={name}
        onChangeText={onNameChange}
        style={styles.name}
      />

      {isLeaf ? (
        <TextInput
          value={String(amount)}
          keyboardType="numeric"
          onChangeText={(t) => onAmountChange(Number(t) || 0)}
          style={styles.amount}
        />
      ) : (
        <AppText style={styles.total}>${amount}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  name: { flex: 1, borderBottomWidth: 1, marginRight: 8 },
  amount: { width: 80, borderBottomWidth: 1, textAlign: "right" },
  total: { fontWeight: "600" },
});
