import { useEffect, useRef, useState } from "react";
import { SafeAreaView, ScrollView, Button } from "react-native";
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

const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);

const EMPTY_BUDGET: BudgetNode = {
  id: "1",
  name: "Presupuesto",
  amount: 0,
  children: [],
};

export default function HomeScreen() {
  const [data, setData] = useState<BudgetNode>(EMPTY_BUDGET);
  const timeout = useRef<any>(null);

  useEffect(() => {
    load.execute().then((d) => d && setData(d));
  }, []);

  const persist = (updated: BudgetNode) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => save.execute(updated), 500);
    setData(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Button title="Reset" onPress={() => persist(EMPTY_BUDGET)} />

      <ScrollView>
        <BudgetTree
          node={data}
          onAmountChange={(id, v) =>
            persist(updateNodeAmount(data, id, v))
          }
          onNameChange={(id, n) =>
            persist(updateNodeName(data, id, n))
          }
          onAddChild={(id) =>
            persist(addChildNode(data, id))
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
