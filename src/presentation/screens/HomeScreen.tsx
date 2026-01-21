import { useEffect, useRef, useState } from "react";
import {ScrollView,View,TouchableOpacity,StyleSheet,Alert,ActivityIndicator,useColorScheme,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeArea } from "../components/atoms/SafeArea";
import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetPieChart } from "../components/molecules/BudgetPieChart";
import { BudgetNode } from "../../domain/entities/BudgetNode";

import {updateNodeAmount,updateNodeName,addChildNode,findNodeById,removeNodeById,existsNodeId,} from "../utils/budgetTreeUtils";
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
// Storage y casos de uso para cargar/guardar y generar datos del pie chart
const storage = new BudgetStorage();
const load = new LoadBudgetUseCase(storage);
const save = new SaveBudgetUseCase(storage);
const pieUC = new GetPieChartDataUseCase();

/* ---------------- HELPERS ---------------- */
// Crea un presupuesto raíz vacío (nodo "Presupuesto")
const makeEmptyRoot = (): BudgetNode => ({
  id: "1",
  name: "Presupuesto",
  amount: 0,
  children: [],
});

// Clave para persistir el modo de tema
const THEME_KEY = "theme_mode";

// Pantalla principal: árbol de presupuesto + gráfico + exportaciones + tema + navegación
export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProps;
}) {
  // Tema actual (colores) y modo (auto/light/dark)
  const { colors, mode, setMode } = useThemeContext();

  // Esquema del sistema (light/dark) para mostrarlo al usuario
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  // Presupuesto raíz actual
  const [data, setData] = useState<BudgetNode | null>(null);
  // Indicador de guardado en proceso
  const [isSaving, setIsSaving] = useState(false);
  // Key para forzar re-mount del árbol cuando se resetea
  const [treeKey, setTreeKey] = useState(0);

  // Stack de navegación del gráfico (para drill-down por categorías)
  const [chartStack, setChartStack] = useState<string[]>(["1"]);
  // Nodo actualmente seleccionado para el gráfico
  const selectedNodeId = chartStack[chartStack.length - 1] ?? "1";

  // Timeout para debounce del guardado (evita guardar en cada tecla)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Referencia al último estado del presupuesto (para exportar aunque haya renders)
  const latestDataRef = useRef<BudgetNode | null>(null);

  // Carga inicial: tema + presupuesto
  useEffect(() => {
    let mounted = true;

    (async () => {
      // ======= Cargar tema guardado =======
      try {
        const saved = (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null;
        if (
          mounted &&
          (saved === "auto" || saved === "light" || saved === "dark")
        ) {
          setMode(saved);
        }
      } catch {}

      // ======= Cargar presupuesto guardado =======
      const stored = await load.execute();
      if (!mounted) return;

      // Si no hay guardado, crea uno vacío
      const root = stored ?? makeEmptyRoot();

      // Si no existía, lo persistimos para que ya haya base
      if (!stored) {
        try {
          await save.execute(root);
        } catch {}
      }

      // Actualiza estado y refs
      setData(root);
      latestDataRef.current = root;
      // Inicializa el chart en la raíz
      setChartStack([root.id]);
    })();

    // Cleanup: evita setState tras unmount y limpia el debounce
    return () => {
      mounted = false;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [setMode]);

  // Persiste el tema seleccionado (y actualiza el contexto)
  const persistTheme = async (next: ThemeMode) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  // Alterna entre auto -> dark -> light -> auto
  const toggleTheme = async () => {
    const next: ThemeMode =
      mode === "auto" ? "dark" : mode === "dark" ? "light" : "auto";
    await persistTheme(next);
  };

  // Aplica un cambio al árbol y lo guarda con debounce
  const applyAndPersist = (updater: (prev: BudgetNode) => BudgetNode) => {
    setData((prev) => {
      if (!prev) return prev;

      // Aplica la actualización (inmutable)
      const updated = updater(prev);
      // Guarda referencia al estado más reciente
      latestDataRef.current = updated;

      // Reinicia debounce de guardado
      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      // Marca como "guardando"
      setIsSaving(true);
      saveTimeout.current = setTimeout(async () => {
        try {
          // Persiste en storage
          await save.execute(updated);
        } finally {
          setIsSaving(false);
        }
      }, 500);

      return updated;
    });
  };

  // Resetea el presupuesto a vacío y lo persiste inmediatamente
  const resetBudget = async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    const root = makeEmptyRoot();
    setData(root);
    latestDataRef.current = root;

    // Fuerza re-mount del árbol (por si hay estados internos)
    setTreeKey((k) => k + 1);
    // Regresa el gráfico al nivel raíz
    setChartStack([root.id]);

    // Guarda de inmediato
    setIsSaving(true);
    try {
      await save.execute(root);
    } finally {
      setIsSaving(false);
    }
  };

  // Exporta el presupuesto actual a CSV
  const onExportCSV = async () => {
    const current = latestDataRef.current;
    if (!current) return;

    try {
      await exportBudgetToCSV(current);
    } catch (e: any) {
      Alert.alert("Error al exportar CSV", e?.message ?? "Error desconocido");
    }
  };

  // Exporta el presupuesto actual a PDF
  const onExportPDF = async () => {
    const current = latestDataRef.current;
    if (!current) return;

    try {
      await exportBudgetToPDF(current);
    } catch (e: any) {
      Alert.alert("Error al exportar PDF", e?.message ?? "Error desconocido");
    }
  };

  // Al seleccionar un segmento del pie chart, baja al siguiente nivel si tiene hijos
  const onSelectSlice = (id: string) => {
    if (!data) return;

    const node = findNodeById(data, id);
    if (!node) return;

    const children = node.children ?? [];
    // Si es hoja, no hay drill-down
    if (children.length === 0) return;

    // Agrega el id al stack para navegar en el gráfico
    setChartStack((prev) => [...prev, id]);
  };

  // Regresa un nivel en el gráfico
  const backChart = () => {
    setChartStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Elimina una categoría con confirmación y ajusta el estado del chartStack
  const onDeleteCategory = (id: string, label: string) => {
    if (!data) return;
    // No permitir borrar la raíz
    if (id === data.id) return;

    Alert.alert(
      "Eliminar categoría",
      `¿Seguro que deseas eliminar "${label}"?\nSe borrarán también sus subcategorías.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            // Aplica eliminación y persiste
            applyAndPersist((prev) => removeNodeById(prev, id));

            // Limpia el id borrado del stack del gráfico
            setChartStack((prev) => {
              const next = prev.filter((x) => x !== id);
              return next.length > 0 ? next : ["1"];
            });

            // Revalida selección después del update (microtask)
            setTimeout(() => {
              const root = latestDataRef.current;
              if (!root) return;

              setChartStack((prev) => {
                const sel = prev[prev.length - 1] ?? "1";
                // Si el seleccionado aún existe, se conserva
                if (existsNodeId(root, sel)) return prev;
                // Si ya no existe, vuelve a la raíz
                return [root.id];
              });
            }, 0);
          },
        },
      ]
    );
  };

  // Estado inicial mientras carga presupuesto
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

  // Nodo actualmente seleccionado para el gráfico (o raíz como fallback)
  const selectedNode = findNodeById(data, selectedNodeId) ?? data;
  // Título dinámico según el nivel en el que estamos
  const chartTitle = `Distribución: ${selectedNode.name}`;

  return (
    <SafeArea style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 🧭 Navegación a pantalla de historial */}
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

        {/* 🌓 Toggle de tema (auto/dark/light) */}
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

        {/* 🔙 Botón para regresar un nivel en la gráfica */}
        {chartStack.length > 1 && (
          <TouchableOpacity onPress={backChart} style={{ marginBottom: 8 }}>
            <AppText style={{ color: colors.primary, fontWeight: "800" }}>
              ← Volver a nivel anterior
            </AppText>
          </TouchableOpacity>
        )}

        {/* 📊 Gráfico de pastel con drill-down */}
        <BudgetPieChart
          title={chartTitle}
          data={pieUC.execute(selectedNode)}
          onSelect={onSelectSlice}
          // Centro con color de fondo para que se vea bien en dark
          centerColor={colors.bg}
        />

        {/* ✅ Indicador visual de guardado */}
        <View style={styles.saveRow}>
          <View
            style={[
              styles.dot,
              // Cambia color según si está guardando o ya guardó
              { backgroundColor: isSaving ? colors.warn : colors.ok },
            ]}
          />
          <AppText style={{ fontWeight: "700", color: colors.text }}>
            {isSaving ? "Guardando..." : "Guardado"}
          </AppText>
        </View>

        {/* 🌳 Árbol de presupuesto (edición + agregar + eliminar) */}
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
          onDelete={onDeleteCategory}
        />
      </ScrollView>

      {/* Contenedor inferior fijo con acciones */}
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
            // Deshabilita visualmente mientras se guarda
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

        {/* Reset de presupuesto */}
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

// Estilos de la pantalla Home
const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  // Padding bottom grande para no tapar contenido con el contenedor inferior fijo
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
