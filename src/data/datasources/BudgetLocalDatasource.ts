import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "BUDGET_TREE";

export class BudgetLocalDatasource {
  async save(data: string) {
    await AsyncStorage.setItem(KEY, data);
  }

  async load(): Promise<string | null> {
    return AsyncStorage.getItem(KEY);
  }
}
