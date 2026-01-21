import AsyncStorage from "@react-native-async-storage/async-storage";

// Clave única usada para almacenar el árbol de presupuesto en AsyncStorage
const KEY = "BUDGET_TREE";

// Datasource local responsable de la persistencia del presupuesto
export class BudgetLocalDatasource {
  // Guarda el presupuesto serializado (string) en AsyncStorage
  async save(raw: string): Promise<void> {
    await AsyncStorage.setItem(KEY, raw);
  }

  // Recupera el presupuesto almacenado desde AsyncStorage
  // Retorna el string guardado o null si no existe
  async load(): Promise<string | null> {
    return AsyncStorage.getItem(KEY);
  }

  // Elimina el presupuesto almacenado en AsyncStorage
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
  }
}
