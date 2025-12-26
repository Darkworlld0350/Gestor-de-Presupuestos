import AsyncStorage from "@react-native-async-storage/async-storage";
import { BudgetNode } from "../../domain/entities/BudgetNode";

const KEY = "@budget_tree";

export class BudgetStorage {
  async save(tree: BudgetNode): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(tree));
  }

  async load(): Promise<BudgetNode | null> {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : null;
  }
}
