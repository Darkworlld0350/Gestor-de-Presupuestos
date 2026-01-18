import AsyncStorage from "@react-native-async-storage/async-storage";
import { BudgetNode } from "../../domain/entities/BudgetNode";

const BUDGET_KEY = "budget_current";
const HISTORY_KEY = "budget_history";

/** 🔑 prefijos para settings */
const SETTINGS_PREFIX = "settings_";

export class BudgetStorage {
  /* ================== PRESUPUESTO ================== */
  async save(budget: BudgetNode) {
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budget));

    const history = await this.getHistory();
    const entry = {
      date: new Date().toISOString(),
      budget,
    };

    await AsyncStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([entry, ...history])
    );
  }

  async load(): Promise<BudgetNode | null> {
    const data = await AsyncStorage.getItem(BUDGET_KEY);
    return data ? JSON.parse(data) : null;
  }

  async getHistory(): Promise<
    { date: string; budget: BudgetNode }[]
  > {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }

  async clear() {
    await AsyncStorage.multiRemove([BUDGET_KEY, HISTORY_KEY]);
  }

  /* ================== SETTINGS (TEMA, ETC.) ================== */
  async setString(key: string, value: string) {
    await AsyncStorage.setItem(
      `${SETTINGS_PREFIX}${key}`,
      value
    );
  }

  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(
      `${SETTINGS_PREFIX}${key}`
    );
  }

  async removeString(key: string) {
    await AsyncStorage.removeItem(
      `${SETTINGS_PREFIX}${key}`
    );
  }
}
