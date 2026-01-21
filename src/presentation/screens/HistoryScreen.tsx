import React, { useEffect, useMemo, useState } from "react";
import {View,TouchableOpacity,StyleSheet,ScrollView,Alert,ActivityIndicator,} from "react-native";
import { SafeArea } from "../components/atoms/SafeArea";
import { AppText } from "../components/atoms/AppText";
import { useThemeContext } from "../styles/theme/useThemeContext";
import type { NavigationProps } from "../../navigation/AppNavigation";
import { BudgetStorage, type HistoryEntry } from "../../data/storage/BudgetStorage";
import type { BudgetNode } from "../../domain/entities/BudgetNode";

// Instancia del storage para leer/escribir historial, favoritos y restauración
const storage = new BudgetStorage();

// Formatea una fecha ISO a formato legible
function formatDate(iso: string) {
  const d = new Date(iso);
  // Si el ISO no es válido, regresa el string original
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

// Calcula el total de un presupuesto (suma recursiva de hojas)
function totalOf(node: BudgetNode): number {
  const children = node.children ?? [];
  // Nodo hoja: retorna su monto
  if (children.length === 0) return Number(node.amount) || 0;
  // Nodo padre: suma los totales de hijos
  return children.reduce((acc, c) => acc + totalOf(c), 0);
}

// Pantalla que muestra el historial de presupuestos guardados
export default function HistoryScreen({
  navigation,
}: {
  navigation: NavigationProps;
}) {
  // Colores del tema actual
  const { colors } = useThemeContext();

  // Lista de entradas del historial
  const [items, setItems] = useState<HistoryEntry[]>([]);
  // IDs (date ISO) marcados como favoritos
  const [favorites, setFavorites] = useState<string[]>([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Carga historial + favoritos (reutilizable tras borrar o acciones)
  const loadAll = async () => {
    setLoading(true);
    try {
      // Ejecuta ambas lecturas en paralelo
      const [h, fav] = await Promise.all([
        storage.getHistory(),
        storage.getFavorites(),
      ]);
      setItems(h);
      setFavorites(fav);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial al montar la pantalla
  useEffect(() => {
    // Bandera para evitar setState si el componente se desmonta
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [h, fav] = await Promise.all([
          storage.getHistory(),
          storage.getFavorites(),
        ]);
        // Si ya se desmontó, no actualiza estado
        if (!mounted) return;
        setItems(h);
        setFavorites(fav);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Cleanup: marca como desmontado
    return () => {
      mounted = false;
    };
  }, []);

  // Confirma y borra el historial (sin borrar el presupuesto actual)
  const clearHistory = () => {
    Alert.alert(
      "Borrar historial",
      "¿Seguro que deseas borrar el historial?\nNo borra tu presupuesto actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            await storage.clearHistory();
            // Recarga el estado en pantalla
            await loadAll();
          },
        },
      ]
    );
  };

  // Marca/desmarca una entrada como favorita
  const onToggleFavorite = async (id: string) => {
    try {
      const next = await storage.toggleFavorite(id);
      setFavorites(next);
    } catch {
      Alert.alert("Error", "No se pudo actualizar favorito");
    }
  };

  // Confirma restauración de un presupuesto desde historial
  const onRestore = (entry: HistoryEntry) => {
    Alert.alert(
      "Restaurar presupuesto",
      "¿Quieres restaurar este presupuesto como el actual?\nSe reemplazará el presupuesto actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: async () => {
            try {
              // Guarda el presupuesto seleccionado como actual
              await storage.restore(entry.budget);
              // Regresa a Home (AppNavigation re-monta Home y recarga)
              navigation.goBack();
            } catch {
              Alert.alert("Error", "No se pudo restaurar");
            }
          },
        },
      ]
    );
  };

  // Ordena el listado: favoritos primero, luego el resto
  const merged = useMemo(() => {
    const favSet = new Set(favorites);
    const favs = items.filter((x) => favSet.has(x.date));
    const rest = items.filter((x) => !favSet.has(x.date));
    return [...favs, ...rest];
  }, [items, favorites]);

  return (
    <SafeArea style={[styles.safe, { backgroundColor: colors.bg }]}>
      {/* Header: volver, título y borrar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.85}>
          <AppText style={{ color: colors.primary, fontWeight: "900" }}>
            ← Volver
          </AppText>
        </TouchableOpacity>

        <AppText style={[styles.title, { color: colors.text }]}>
          Historial
        </AppText>

        <TouchableOpacity onPress={clearHistory} activeOpacity={0.85}>
          <AppText style={{ color: colors.danger, fontWeight: "900" }}>
            Borrar
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Estados: cargando, vacío, o lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <AppText style={{ color: colors.textMuted, marginTop: 10 }}>
            Cargando historial...
          </AppText>
        </View>
      ) : merged.length === 0 ? (
        <View style={styles.center}>
          <AppText
            style={{
              color: colors.textMuted,
              textAlign: "center",
              paddingHorizontal: 16,
            }}
          >
            Aún no hay historial.
            {"\n"}Modifica el presupuesto y espera a que se guarde para crear registros.
          </AppText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {merged.map((it) => {
            // Total del presupuesto guardado
            const total = totalOf(it.budget);
            // Número de categorías principales (hijos directos de la raíz)
            const roots = (it.budget.children ?? []).length;
            // Determina si está marcado como favorito
            const isFav = favorites.includes(it.date);

            return (
              <View
                key={it.date}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  {/* Fecha del registro */}
                  <AppText style={{ color: colors.text, fontWeight: "900" }}>
                    {formatDate(it.date)}
                  </AppText>

                  {/* Botón favorito (estrella) */}
                  <TouchableOpacity
                    onPress={() => onToggleFavorite(it.date)}
                    activeOpacity={0.85}
                  >
                    <AppText
                      style={{
                        color: isFav ? colors.warn : colors.textMuted,
                        fontWeight: "900",
                        fontSize: 18,
                      }}
                    >
                      {isFav ? "★" : "☆"}
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Resumen del registro */}
                <AppText style={{ color: colors.textMuted, marginTop: 6 }}>
                  Total: ${total}
                </AppText>
                <AppText style={{ color: colors.textMuted, marginTop: 2 }}>
                  Categorías principales: {roots}
                </AppText>

                {/* Acción: restaurar este presupuesto */}
                <TouchableOpacity
                  onPress={() => onRestore(it)}
                  activeOpacity={0.85}
                  style={[styles.restoreBtn, { backgroundColor: colors.primary }]}
                >
                  <AppText style={{ color: "#fff", fontWeight: "900" }}>
                    Restaurar este presupuesto
                  </AppText>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeArea>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: "900" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restoreBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
