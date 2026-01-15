import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetPieChart } from "../components/molecules/BudgetPieChart";
import { BudgetNode } from "../../domain/entities/BudgetNode";

import {
  updateNodeAmount,
  updateNodeName,
  addChildNode,
} from "../utils/budgetTreeUtils";

import { BudgetStorage } from "../../data/storage/BudgetStorage";
import { LoadBudgetUseCase } from "../../domain/usecases/LoadBudgetUseCase";
import { SaveBudgetUseCase } from "../../domain/usecases/SaveBudgetUseCase";
import { GetPieChartDataUseCase } from "../../domain/usecases/GetPieChartDataUseCase";
import { AppText } from "../components/atoms/AppText";

// ---------------- USE CASES ----------------
const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);
const pieUC = new GetPieChartDataUseCase();

export default function HomeScreen() {
  const [data, setData] = useState<BudgetNode | null>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  // ---------------- LOAD ----------------
  useEffect(() => {
    load.execute().then((d) => {
      if (!d) {
        const root: BudgetNode = {
          id: "1",
          name: "Presupuesto",
          amount: 0,
          children: [],
        };
        save.execute(root);
        setData(root);
      } else {
        setData(d);
      }
    });
  }, []);

  // ---------------- SAVE (DEBOUNCE) ----------------
  const persist = (updated: BudgetNode) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      save.execute(updated);
    }, 500);
    setData(updated);
  };

  if (!data) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* 📊 GRÁFICA GENERAL */}
        <BudgetPieChart data={pieUC.execute(data)} />

        {/* 🌳 ÁRBOL */}
        <BudgetTree
          node={data}
          onAmountChange={(id, v) =>
            persist(updateNodeAmount(data, id, v))
          }
          onNameChange={(id, v) =>
            persist(updateNodeName(data, id, v))
          }
          onAddChild={(id) =>
            persist(addChildNode(data, id))
          }
        />
      </ScrollView>

      {/* 🔴 RESET ABAJO */}
      <View
        style={{
          padding: 12,
          borderTopWidth: 1,
          borderColor: "#e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() =>
            persist({
              id: "1",
              name: "Presupuesto",
              amount: 0,
              children: [],
            })
          }
          style={{
            backgroundColor: "#dc2626",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "700" }}>
            RESET PRESUPUESTO
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
