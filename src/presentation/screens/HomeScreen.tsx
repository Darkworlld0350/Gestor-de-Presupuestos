import { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";

import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetNode } from "../../domain/entities/BudgetNode";

import { BudgetStorage } from "../../data/storage/BudgetStorage";
import { LoadBudgetUseCase } from "../../domain/usecases/LoadBudgetUseCase";
import { SaveBudgetUseCase } from "../../domain/usecases/SaveBudgetUseCase";

// ---------------- DEPENDENCIAS ----------------
const storage = new BudgetStorage();
const loadBudget = new LoadBudgetUseCase(storage);
const saveBudget = new SaveBudgetUseCase(storage);

// ---------------- DATA INICIAL ----------------
const initialData: BudgetNode = {
  id: "1",
  name: "Presupuesto General",
  amount: 0,
  children: [
    {
      id: "1.1",
      name: "Marketing",
      amount: 0,
      children: [
        { id: "1.1.1", name: "Ads", amount: 500, children: [] },
        { id: "1.1.2", name: "Eventos", amount: 300, children: [] },
      ],
    },
    {
      id: "1.2",
      name: "IT",
      amount: 200,
      children: [
        { id: "1.2.1", name: "Infraestructura", amount: 800, children: [] },
      ],
    },
  ],
};

// ---------------- UPDATE HOJA ----------------
function updateNodeAmount(
  node: BudgetNode,
  id: string,
  value: number
): BudgetNode {
  if (node.id === id && node.children.length === 0) {
    return { ...node, amount: value };
  }

  return {
    ...node,
    children: node.children.map((child) =>
      updateNodeAmount(child, id, value)
    ),
  };
}

// ---------------- SCREEN ----------------
export default function HomeScreen() {
  const [data, setData] = useState<BudgetNode | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔑 timer debounce
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // 🔹 CARGAR
  useEffect(() => {
    loadBudget.execute().then((saved) => {
      setData(saved ?? initialData);
      setLoading(false);
    });
  }, []);

  // 🔹 EDITAR + DEBOUNCE SAVE
  const onAmountChange = (id: string, value: number) => {
    setData((prev) => {
      if (!prev) return prev;

      const updated = updateNodeAmount(prev, id, value);

      // ⏳ debounce
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = setTimeout(() => {
        saveBudget.execute(updated);
      }, 500); // 👈 tiempo debounce

      return updated;
    });
  };

  if (loading || !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <BudgetTree node={data} onAmountChange={onAmountChange} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
