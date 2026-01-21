import AsyncStorage from "@react-native-async-storage/async-storage";
import { BudgetNode } from "../../domain/entities/BudgetNode";

// Claves de almacenamiento para presupuesto actual, historial y favoritos
const BUDGET_KEY = "budget_current";
const HISTORY_KEY = "budget_history";
const FAVORITES_KEY = "budget_history_favorites";

// Prefijo común para guardar configuraciones (settings)
const SETTINGS_PREFIX = "settings_";

// Estructura de una entrada del historial de presupuestos
export type HistoryEntry = {
  // Fecha en formato ISO usada como identificador único
  date: string;
  // Snapshot del presupuesto guardado en esa fecha
  budget: BudgetNode;
};

// Clase encargada de manejar toda la persistencia local del presupuesto
export class BudgetStorage {
  /* ================== PRESUPUESTO ================== */

  // Guarda el presupuesto actual y registra una entrada en el historial
  async save(budget: BudgetNode): Promise<void> {
    // Guarda el presupuesto actual
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budget));

    // Obtiene el historial existente
    const history = await this.getHistory();

    // Crea una nueva entrada de historial
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      budget,
    };

    // Guarda el historial actualizado (la entrada más reciente al inicio)
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...history]));
  }

  // Carga el presupuesto actual desde AsyncStorage
  async load(): Promise<BudgetNode | null> {
    const data = await AsyncStorage.getItem(BUDGET_KEY);
    return data ? (JSON.parse(data) as BudgetNode) : null;
  }

  // Restaura un presupuesto sin afectar el historial
  async restore(budget: BudgetNode): Promise<void> {
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  }

  /* ================== HISTORIAL ================== */

  // Obtiene el historial completo de presupuestos guardados
  async getHistory(): Promise<HistoryEntry[]> {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? (JSON.parse(data) as HistoryEntry[]) : [];
  }

  // Elimina todo el historial de presupuestos
  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(HISTORY_KEY);
  }

  // Elimina tanto el presupuesto actual como su historial
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([BUDGET_KEY, HISTORY_KEY]);
  }

  /* ================== FAVORITOS ================== */

  // Obtiene la lista de IDs marcados como favoritos
  async getFavorites(): Promise<string[]> {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? (JSON.parse(data) as string[]) : [];
  }

  // Agrega o quita un ID de la lista de favoritos
  async toggleFavorite(id: string): Promise<string[]> {
    const favs = await this.getFavorites();

    // Si existe, lo elimina; si no, lo agrega al inicio
    const next = favs.includes(id)
      ? favs.filter((x) => x !== id)
      : [id, ...favs];

    // Guarda la lista actualizada de favoritos
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    return next;
  }

  // Elimina todos los favoritos guardados
  async clearFavorites(): Promise<void> {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  }

  /* ================== SETTINGS ================== */

  // Guarda un valor string de configuración usando un prefijo común
  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`${SETTINGS_PREFIX}${key}`, value);
  }

  // Obtiene un valor string de configuración
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`${SETTINGS_PREFIX}${key}`);
  }

  // Elimina una configuración almacenada
  async removeString(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${SETTINGS_PREFIX}${key}`);
  }
}
