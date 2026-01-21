import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeArea } from "../components/atoms/SafeArea";
import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetPieChart } from "../components/molecules/BudgetPieChart";
import { BudgetNode } from "../../domain/entities/BudgetNode";

import {
  updateNodeAmount,
  updateNodeName,
  addChildNode,
  findNodeById,
  removeNodeById,
  existsNodeId,
} from "../utils/budgetTreeUtils";

import { LoadBudgetUseCase } from "../../domain/usecases/LoadBudgetUseCase";
import { SaveBudgetUseCase } from "../../domain/usecases/SaveBudgetUseCase";
import { GetPieChartDataUseCase } from "../../domain/usecases/GetPieChartDataUseCase";
import { BudgetStorage } from "../../data/storage/BudgetStorage";

import { exportBudgetToCSV } from "../utils/exportBudgetToCSV";
import { exportBudgetToPDF } from "../utils/exportBudgetToPdf";
import { AppText } from "../components/atoms/AppText";

import { useThemeContext } from "../styles/theme/useThemeContext";
import type { ThemeMode } from "../styles/theme/useThemeContext";
import type { NavigationProps } from "../../navigation/AppNavigation";

/* ---------------- USE CASES ---------------- */
// Instancias de infraestructura (storage) y casos de uso del dominio
const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);
const pieUC = new GetPieChartDataUseCase();

/* ---------------- HELPERS ---------------- */
// Crea el nodo raíz vacío del presupuesto
const makeEmptyRoot = (): BudgetNode => ({
  id: "1",
  name: "Presupuesto",
  amount: 0,
  children: [],
});

// Clave para persistir el modo de tema en AsyncStorage
const THEME_KEY = "theme_mode";

/**  Confirm cross-platform (WEB: confirm, MOBILE: Alert.alert) */
// Muestra confirmación y retorna booleano (true = confirmado)
async function confirmAction(opts: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}): Promise<boolean> {
  const confirmText = opts.confirmText ?? "Aceptar";
  const cancelText = opts.cancelText ?? "Cancelar";

  // En web usamos confirm nativo
  if (Platform.OS === "web") {
    return window.confirm(`${opts.title}\n\n${opts.message}`);
  }

  // En nativo usamos Alert.alert y envolvemos en Promise
  return new Promise((resolve) => {
    Alert.alert(opts.title, opts.message, [
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmText,
        style: opts.destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}

/**  Alert cross-platform (WEB: alert, MOBILE: Alert.alert) */
// Muestra un mensaje simple compatible en web y móvil
function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

/* ---------------- SCREEN ---------------- */
// Pantalla principal: árbol, gráfica, exportación, tema y navegación
export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProps;
}) {
  // Obtiene colores y modo actual del ThemeProvider
  const { colors, mode, setMode } = useThemeContext();
  // Esquema del sistema para mostrarlo como referencia (light/dark)
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  // Estado principal del presupuesto (raíz)
  const [data, setData] = useState<BudgetNode | null>(null);
  // Indica si hay un guardado en curso
  const [isSaving, setIsSaving] = useState(false);
  // Key para forzar re-mount del árbol (útil al resetear)
  const [treeKey, setTreeKey] = useState(0);

  // Stack de navegación del gráfico (drill-down por categoría)
  const [chartStack, setChartStack] = useState<string[]>(["1"]);
  // Nodo seleccionado en el gráfico (último del stack)
  const selectedNodeId = chartStack[chartStack.length - 1] ?? "1";

  // Timeout para debounce del guardado (evita escribir storage en cada cambio)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Referencia al último árbol (para exportar aun si hay renders)
  const latestDataRef = useRef<BudgetNode | null>(null);

  // Carga inicial: tema + presupuesto desde almacenamiento
  useEffect(() => {
    // Bandera para evitar setState si el componente se desmonta
    let mounted = true;

    (async () => {
      // ---------------- THEME ----------------
      try {
        const saved = (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null;
        // Valida y aplica modo persistido
        if (
          mounted &&
          (saved === "auto" || saved === "light" || saved === "dark")
        ) {
          setMode(saved);
        }
      } catch {}

      // ---------------- BUDGET ----------------
      const stored = await load.execute();
      if (!mounted) return;

      // Si no hay presupuesto guardado, crea uno vacío
      const root = stored ?? makeEmptyRoot();

      // Si no existía, lo persistimos para tener base
      if (!stored) {
        try {
          await save.execute(root);
        } catch {}
      }

      // Actualiza estado y referencias
      setData(root);
      latestDataRef.current = root;
      // Inicializa la gráfica en el root
      setChartStack([root.id]);
    })();

    // Cleanup: limpia debounce y evita updates tras unmount
    return () => {
      mounted = false;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [setMode]);

  // Persiste el modo seleccionado y actualiza el ThemeContext
  const persistTheme = async (next: ThemeMode) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  // Cicla entre auto → dark → light → auto
  const toggleTheme = async () => {
    const next: ThemeMode =
      mode === "auto" ? "dark" : mode === "dark" ? "light" : "auto";
    await persistTheme(next);
  };

  // Aplica un cambio inmutable al árbol y lo guarda con debounce
  const applyAndPersist = (updater: (prev: BudgetNode) => BudgetNode) => {
    setData((prev) => {
      if (!prev) return prev;

      // Calcula el árbol actualizado
      const updated = updater(prev);
      // Guarda referencia al último estado
      latestDataRef.current = updated;

      // Reinicia el debounce si ya había uno pendiente
      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      // Indica guardado en progreso
      setIsSaving(true);

      // Debounce: guarda después de 500ms sin cambios
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

  // Resetea el presupuesto a vacío (confirmado) y lo persiste
  const resetBudget = async () => {
    // Cancela cualquier guardado pendiente
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    // Confirmación cross-platform
    const ok = await confirmAction({
      title: "Reset presupuesto",
      message: "¿Seguro que deseas reiniciar el presupuesto a vacío?",
      confirmText: "Reset",
      cancelText: "Cancelar",
      destructive: true,
    });

    if (!ok) return;

    // Crea root vacío y actualiza estado
    const root = makeEmptyRoot();
    setData(root);
    latestDataRef.current = root;

    // Forzar re-mount del árbol por seguridad
    setTreeKey((k) => k + 1);
    // Reinicia navegación de gráfica
    setChartStack([root.id]);

    // Guarda inmediatamente
    setIsSaving(true);
    try {
      await save.execute(root);
    } finally {
      setIsSaving(false);
    }
  };

  // Exporta a CSV usando el último estado disponible
  const onExportCSV = async () => {
    const current = latestDataRef.current;
    if (!current) return;

    try {
      await exportBudgetToCSV(current);
    } catch (e: any) {
      showMessage("Error al exportar CSV", e?.message ?? "Error desconocido");
    }
  };

  // Exporta a PDF usando el último estado disponible
  const onExportPDF = async () => {
    const current = latestDataRef.current;
    if (!current) return;

    try {
      await exportBudgetToPDF(current);
    } catch (e: any) {
      showMessage("Error al exportar PDF", e?.message ?? "Error desconocido");
    }
  };

  // Cuando se selecciona un slice del pie chart:
  // si el nodo tiene hijos, hace "drill down" (baja un nivel)
  const onSelectSlice = (id: string) => {
    if (!data) return;

    const node = findNodeById(data, id);
    if (!node) return;

    const children = node.children ?? [];
    // Si es hoja no se puede profundizar
    if (children.length === 0) return;

    setChartStack((prev) => [...prev, id]);
  };

  // Regresa un nivel en la navegación del gráfico
  const backChart = () => {
    setChartStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Elimina una categoría (con confirmación) y repara el chartStack si era seleccionado
  const onDeleteCategory = async (id: string, label: string) => {
    if (!data) return;
    // No permitir eliminar la raíz
    if (id === data.id) return;

    const ok = await confirmAction({
      title: "Eliminar categoría",
      message: `¿Seguro que deseas eliminar "${label}"?\nSe borrarán también sus subcategorías.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      destructive: true,
    });

    if (!ok) return;

    // Elimina y persiste
    applyAndPersist((prev) => removeNodeById(prev, id));

    // Quita el id borrado del stack del gráfico
    setChartStack((prev) => {
      const next = prev.filter((x) => x !== id);
      return next.length > 0 ? next : ["1"];
    });

    // Revalida selección tras actualizar el árbol
    setTimeout(() => {
      const root = latestDataRef.current;
      if (!root) return;

      setChartStack((prev) => {
        const sel = prev[prev.length - 1] ?? "1";
        // Si aún existe, conserva; si no, vuelve a raíz
        if (existsNodeId(root, sel)) return prev;
        return [root.id];
      });
    }, 0);
  };

  // Estado de carga inicial del presupuesto
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

  // Nodo actual para el gráfico (según el stack), con fallback a raíz
  const selectedNode = findNodeById(data, selectedNodeId) ?? data;
  // Título dinámico de la gráfica
  const chartTitle = `Distribución: ${selectedNode.name}`;

  return (
    <SafeArea style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/*  Navegación a historial */}
        <TouchableOpacity
          onPress={() => navigation.navigate("History")}
          style={[
            styles.navButton,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          activeOpacity={0.85}
        >
          <AppText style={{ fontWeight: "900", color: colors.primary }}>
            Ver historial →
          </AppText>
          <AppText style={{ color: colors.textMuted, marginTop: 2 }}>
            Registros de guardados anteriores
          </AppText>
        </TouchableOpacity>

        {/*  Tema */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.modePill,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <AppText style={{ fontWeight: "800", color: colors.text }}>
            Modo: {mode === "auto" ? "Auto" : mode === "dark" ? "Oscuro" : "Claro"}{" "}
            (tocar)
          </AppText>
          <AppText style={{ opacity: 0.8, color: colors.textMuted }}>
            Sistema: {systemScheme ?? "desconocido"}
          </AppText>
        </TouchableOpacity>

        {/*  Volver nivel gráfica */}
        {chartStack.length > 1 && (
          <TouchableOpacity onPress={backChart} style={{ marginBottom: 8 }}>
            <AppText style={{ color: colors.primary, fontWeight: "800" }}>
              ← Volver a nivel anterior
            </AppText>
          </TouchableOpacity>
        )}

        {/*  Pie */}
        <BudgetPieChart
          title={chartTitle}
          data={pieUC.execute(selectedNode)}
          onSelect={onSelectSlice}
          // Centro del donut con el mismo fondo para dark mode
          centerColor={colors.bg}
        />

        {/*  Guardado */}
        <View style={styles.saveRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isSaving ? colors.warn : colors.ok },
            ]}
          />
          <AppText style={{ fontWeight: "700", color: colors.text }}>
            {isSaving ? "Guardando..." : "Guardado"}
          </AppText>
        </View>

        {/*  Tree */}
        <BudgetTree
          key={treeKey}
          node={data}
          onAmountChange={(id, value) =>
            applyAndPersist((prev) => updateNodeAmount(prev, id, value))
          }
          onNameChange={(id, name) =>
            applyAndPersist((prev) => updateNodeName(prev, id, name))
          }
          onAddChild={(id) => applyAndPersist((prev) => addChildNode(prev, id))}
          onDelete={onDeleteCategory}
        />
      </ScrollView>

      {/* botones */}
      <View
        style={[
          styles.bottomContainer,
          { borderColor: colors.border, backgroundColor: colors.bg },
        ]}
      >
        {/* Exportar PDF */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.neutral },
            isSaving ? { opacity: 0.6 } : null,
          ]}
          onPress={onExportPDF}
          disabled={isSaving}
        >
          <AppText style={styles.buttonText}>EXPORTAR A PDF</AppText>
        </TouchableOpacity>

        {/* Exportar CSV */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            isSaving ? { opacity: 0.6 } : null,
          ]}
          onPress={onExportCSV}
          disabled={isSaving}
        >
          <AppText style={styles.buttonText}>EXPORTAR A CSV</AppText>
        </TouchableOpacity>

        {/* Reset */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.danger }]}
          onPress={resetBudget}
        >
          <AppText style={styles.buttonText}>RESET PRESUPUESTO</AppText>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

// Estilos del HomeScreen
const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  // paddingBottom grande para evitar que el contenedor inferior tape el contenido
  content: { padding: 16, paddingBottom: 300 },

  navButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },

  modePill: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 14,
  },

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

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
