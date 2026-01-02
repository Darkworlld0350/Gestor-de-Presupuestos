import { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";

import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetNode } from "../../domain/entities/BudgetNode";
import {
  updateNodeAmount,
  updateNodeName,
  addChildNode,
} from "../utils/budgetTreeUtils";

import { BudgetStorage } from "../../data/storage/BudgetStorage";
import { LoadBudgetUseCase } from "../../domain/usecases/LoadBudgetUseCase";
import { SaveBudgetUseCase } from "../../domain/usecases/SaveBudgetUseCase";
import { AppText } from "../components/atoms/AppText";

const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);

export default function HomeScreen() {
  const [data, setData] = useState<BudgetNode | null>(null);
  const timeout = useRef<any>(null);

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

  const persist = (updated: BudgetNode) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => save.execute(updated), 500);
    setData(updated);
  };

  if (!data) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
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

      {/* 🔽 RESET ABAJO (FIJO PARA MÓVIL) */}
      <View
        style={{
          padding: 12,
          borderTopWidth: 1,
          borderColor: "#e5e7eb",
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
            backgroundColor: "#2563eb",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "600" }}>
            RESET
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
