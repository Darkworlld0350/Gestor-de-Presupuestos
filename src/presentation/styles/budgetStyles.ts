import { StyleSheet } from "react-native";

// Estilos reutilizables para filas y campos del árbol de presupuesto
export const budgetStyles = StyleSheet.create({
  // Estilo base de la fila (contenedor de cada item)
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 4,

    // Valores base (modo claro); en tema oscuro se sobreescriben al renderizar
    backgroundColor: "#f8fafc",
  },

  // Input para el nombre de la categoría
  nameInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginRight: 8,

    // Línea inferior para dar estilo tipo "underline"
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",

    // Color base (se sobreescribe por tema)
    color: "#0f172a",
  },

  // Input para el monto cuando el nodo es hoja
  amountInput: {
    minWidth: 90,
    textAlign: "right",
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 6,

    // Línea inferior destacada para el monto
    borderBottomWidth: 1,
    borderColor: "#2563eb",

    // Color base del monto (se sobreescribe por tema)
    color: "#1e3a8a",
  },

  // Texto para mostrar el total calculado en nodos padre
  total: {
    fontSize: 16,
    fontWeight: "600",

    // Color base (se sobreescribe por tema)
    color: "#0f172a",
  },

  // Indicador de colapsado/expandido (flecha)
  arrow: {
    fontSize: 14,

    // Color base (se sobreescribe por tema)
    color: "#64748b",
  },

  // Estilo para el botón/label de agregar (si se usa en algún lugar)
  addBtn: {
    marginLeft: 24,
    marginVertical: 6,
    fontSize: 14,

    // Color base (se sobreescribe por tema)
    color: "#2563eb",
  },
});
