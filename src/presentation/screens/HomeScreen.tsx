import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeArea } from "../components/atoms/SafeArea"; // ✅ NUEVO
import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetPieChart } from "../components/molecules/BudgetPieChart";
import { BudgetNode } from "../../domain/entities/BudgetNode";

import { updateNodeAmount, updateNodeName, addChildNode } from "../utils/budgetTreeUtils";

import { BudgetStorage } from "../../data/storage/BudgetStorage";
import { LoadBudgetUseCase } from "../../domain/usecases/LoadBudgetUseCase";
import { SaveBudgetUseCase } from "../../domain/usecases/SaveBudgetUseCase";
import { GetPieChartDataUseCase } from "../../domain/usecases/GetPieChartDataUseCase";

import { exportBudgetToCSV } from "../utils/exportBudgetToCSV";
import { exportBudgetToPDF } from "../utils/exportBudgetToPdf";
import { AppText } from "../components/atoms/AppText";

import { useThemeContext } from "../theme/useThemeContext";
import type { ThemeMode } from "../theme/useThemeContext";

const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);
const pieUC = new GetPieChartDataUseCase();

const makeEmptyRoot = (): BudgetNode => ({
  id: "1",
  name: "Presupuesto",
  amount: 0,
  children: [],
});

const THEME_KEY = "theme_mode";

export default function HomeScreen() {
  const { colors, mode, setMode } = useThemeContext();
  const systemScheme = useColorScheme(); // "light" | "dark" | null | undefined

  const [data, setData] = useState<BudgetNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [treeKey, setTreeKey] = useState(0);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<BudgetNode | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null;
        if (mounted && (saved === "auto" || saved === "light" || saved === "dark")) {
          setMode(saved);
        }
      } catch {}

      const stored = await load.execute();
      if (!mounted) return;

      const root = stored ?? makeEmptyRoot();
      if (!stored) await save.execute(root);

      setData(root);
      latestDataRef.current = root;
    })();

    return () => {
      mounted = false;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [setMode]);

  const persistTheme = async (next: ThemeMode) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  const toggleTheme = async () => {
    const next: ThemeMode = mode === "auto" ? "dark" : mode === "dark" ? "light" : "auto";
    await persistTheme(next);
  };

  const applyAndPersist = (updater: (prev: BudgetNode) => BudgetNode) => {
    setData((prev) => {
      if (!prev) return prev;

      const updated = updater(prev);
      latestDataRef.current = updated;

      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      setIsSaving(true);
      saveTimeout.current = setTimeout(async () => {
        try {
          await save.execute(updated);
        } finally {
          setIsSaving(false);
        }
      }, 500);

      return updated;
    });
  };

  const resetBudget = async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    const root = makeEmptyRoot();
    setData(root);
    latestDataRef.current = root;

    setTreeKey((k) => k + 1);

    setIsSaving(true);
    try {
      await save.execute(root);
    } finally {
      setIsSaving(false);
    }
  };

  const onExportCSV = async () => {
    const current = latestDataRef.current;
    if (!current) return;

    try {
      await exportBudgetToCSV(current);
    } catch (e: any) {
      Alert.alert("Error al exportar CSV", e?.message ?? "Error desconocido");
    }
  };

  const onExportPDF = async () => {
    const current = latestDataRef.current;
    if (!current) return;

    try {
      await exportBudgetToPDF(current);
    } catch (e: any) {
      Alert.alert("Error al exportar PDF", e?.message ?? "Error desconocido");
    }
  };

  if (!data) {
    return (
      <SafeArea style={[styles.safe, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" />
        <AppText style={{ marginTop: 10, opacity: 0.85, color: colors.text }}>
          Cargando...
        </AppText>
      </SafeArea>
    );
  }

  return (
    <SafeArea style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.modePill,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <AppText style={{ fontWeight: "800", color: colors.text }}>
            Modo: {mode === "auto" ? "Auto" : mode === "dark" ? "Oscuro" : "Claro"} (tocar)
          </AppText>
          <AppText style={{ opacity: 0.8, color: colors.textMuted }}>
            Sistema: {systemScheme ?? "desconocido"}
          </AppText>
        </TouchableOpacity>

        <BudgetPieChart data={pieUC.execute(data)} />

        <View style={styles.saveRow}>
          <View style={[styles.dot, { backgroundColor: isSaving ? colors.warn : colors.ok }]} />
          <AppText style={{ fontWeight: "700", color: colors.text }}>
            {isSaving ? "Guardando..." : "Guardado"}
          </AppText>
        </View>

        <BudgetTree
          key={treeKey}
          node={data}
          onAmountChange={(id, value) => applyAndPersist((prev) => updateNodeAmount(prev, id, value))}
          onNameChange={(id, name) => applyAndPersist((prev) => updateNodeName(prev, id, name))}
          onAddChild={(id) => applyAndPersist((prev) => addChildNode(prev, id))}
        />
      </ScrollView>

      <View style={[styles.bottomContainer, { borderColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.neutral }, isSaving ? { opacity: 0.6 } : null]}
          onPress={onExportPDF}
          disabled={isSaving}
        >
          <AppText style={styles.buttonText}>EXPORTAR A PDF</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, isSaving ? { opacity: 0.6 } : null]}
          onPress={onExportCSV}
          disabled={isSaving}
        >
          <AppText style={styles.buttonText}>EXPORTAR A CSV</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger }]} onPress={resetBudget}>
          <AppText style={styles.buttonText}>RESET PRESUPUESTO</AppText>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 280 },

  modePill: { padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 14 },

  saveRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
  },

  button: { paddingVertical: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
