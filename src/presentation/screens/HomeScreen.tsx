import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

/* ---------------- USE CASES ---------------- */
const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);
const pieUC = new GetPieChartDataUseCase();

/* ---------------- HELPERS ---------------- */
const makeEmptyRoot = (): BudgetNode => ({
  id: "1",
  name: "Presupuesto",
  amount: 0,
  children: [],
});

export default function HomeScreen() {
  const [data, setData] = useState<BudgetNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🔁 fuerza remount del árbol al reset (por si BudgetTree tiene estado interno)
  const [treeKey, setTreeKey] = useState(0);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<BudgetNode | null>(null);

  /* -------- LOAD INITIAL DATA -------- */
  useEffect(() => {
    let mounted = true;

    load.execute().then((stored) => {
      if (!mounted) return;

      const root = stored ?? makeEmptyRoot();

      if (!stored) {
        save.execute(root);
      }

      setData(root);
      latestDataRef.current = root;
    });

    return () => {
      mounted = false;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  /* -------- APPLY UPDATE + SAVE WITH DEBOUNCE (sin estado viejo) -------- */
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

  /* -------- RESET (guarda inmediato + remount del árbol) -------- */
  const resetBudget = async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    const root = makeEmptyRoot();
    setData(root);
    latestDataRef.current = root;

    // ✅ fuerza que BudgetTree reinicie su estado interno (colapsos, etc.)
    setTreeKey((k) => k + 1);

    setIsSaving(true);
    try {
      await save.execute(root);
    } finally {
      setIsSaving(false);
    }
  };

  /* -------- EXPORTS -------- */
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
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" />
        <AppText style={{ marginTop: 10, opacity: 0.7 }}>Cargando...</AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 📊 PIE CHART */}
        <BudgetPieChart data={pieUC.execute(data)} />

        {/* ✅ INDICADOR GUARDADO */}
        <View style={styles.saveRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isSaving ? "#f59e0b" : "#10b981" },
            ]}
          />
          <AppText style={styles.saveText}>
            {isSaving ? "Guardando..." : "Guardado"}
          </AppText>
        </View>

        {/* 🌳 TREE */}
        <BudgetTree
          key={treeKey}
          node={data}
          onAmountChange={(id, value) =>
            applyAndPersist((prev) => updateNodeAmount(prev, id, value))
          }
          onNameChange={(id, name) =>
            applyAndPersist((prev) => updateNodeName(prev, id, name))
          }
          onAddChild={(id) =>
            applyAndPersist((prev) => addChildNode(prev, id))
          }
        />
      </ScrollView>

      {/* 🔘 BOTTOM ACTIONS */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, styles.pdfButton, isSaving ? { opacity: 0.6 } : null]}
          onPress={onExportPDF}
          disabled={isSaving}
        >
          <AppText style={styles.buttonText}>EXPORTAR A PDF</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.exportButton, isSaving ? { opacity: 0.6 } : null]}
          onPress={onExportCSV}
          disabled={isSaving}
        >
          <AppText style={styles.buttonText}>EXPORTAR A CSV</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetBudget}>
          <AppText style={styles.buttonText}>RESET PRESUPUESTO</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 260 },
  saveRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  saveText: { fontWeight: "600", opacity: 0.8 },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  pdfButton: { backgroundColor: "#111827", marginBottom: 8 },
  exportButton: { backgroundColor: "#2563eb", marginBottom: 8 },
  resetButton: { backgroundColor: "#dc2626" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
