import { StyleSheet } from "react-native";

export const budgetStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc", // gris muy claro
    marginVertical: 4,
  },

  nameInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginRight: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  amountInput: {
    minWidth: 90,
    textAlign: "right",
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#2563eb", // azul
    color: "#1e3a8a",
  },

  total: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },

  arrow: {
    fontSize: 14,
    color: "#64748b",
  },

  addBtn: {
    marginLeft: 24,
    marginVertical: 6,
    color: "#2563eb",
    fontSize: 14,
  },
});
