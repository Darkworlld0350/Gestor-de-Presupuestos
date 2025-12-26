import { View, TextInput, StyleSheet } from "react-native";
import { AppText } from "../atoms/AppText";

interface Props {
  name: string;
  total: number;
  isLeaf: boolean; // 🔴 ya NO es opcional
  onChange?: (value: number) => void;
}

export function BudgetItem({
  name,
  total,
  isLeaf,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText style={styles.label}>{name}:</AppText>

      {isLeaf ? (
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(total)}
          editable={true} // 🔑 importante en Android
          onChangeText={(text) => onChange?.(Number(text) || 0)}
        />
      ) : (
        <AppText style={styles.total}>${total}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  label: {
    width: 140,
  },
  input: {
    borderBottomWidth: 1,
    minWidth: 80,
    textAlign: "right",
    paddingVertical: 2,
  },
  total: {
    fontWeight: "600",
  },
});
