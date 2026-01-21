import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeArea } from "../components/atoms/SafeArea";
import { AppText } from "../components/atoms/AppText";
import { useThemeContext } from "../styles/theme/useThemeContext";
import type { NavigationProps } from "../../navigation/AppNavigation";
import {
  BudgetStorage,
  type HistoryEntry,
} from "../../data/storage/BudgetStorage";
import type { BudgetNode } from "../../domain/entities/BudgetNode";

// Instancia del storage (maneja historial, favoritos y restore usando AsyncStorage)
const storage = new BudgetStorage();

/* ---------------- HELPERS ---------------- */

// Formatea una fecha ISO a formato legible para mostrarla en pantalla
function formatDate(iso: string) {
  const d = new Date(iso);
  // Si no se pudo parsear, devuelve el string original
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

// Calcula el total de un presupuesto (suma recursiva: hojas = amount)
function totalOf(node: BudgetNode): number {
  const children = node.children ?? [];
  // Nodo hoja: retorna el monto capturado
  if (children.length === 0) return Number(node.amount) || 0;
  // Nodo padre: suma totales de hijos
  return children.reduce((acc, c) => acc + totalOf(c), 0);
}

//  Confirm cross-platform (WEB: window.confirm, MOBILE: Alert.alert)
// Muestra un diálogo de confirmación y retorna true/false según la respuesta
async function confirmAction(opts: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}): Promise<boolean> {
  const confirmText = opts.confirmText ?? "Aceptar";
  const cancelText = opts.cancelText ?? "Cancelar";

  // En web, se usa confirm del navegador
  if (Platform.OS === "web") {
    return window.confirm(`${opts.title}\n\n${opts.message}`);
  }

  // En nativo, se usa Alert.alert envuelto en Promise
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

//  Alert cross-platform (WEB: window.alert, MOBILE: Alert.alert)
// Muestra un mensaje simple y compatible entre plataformas
function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

/* ---------------- SCREEN ---------------- */

// Pantalla de historial: lista versiones guardadas del presupuesto
export default function HistoryScreen({
  navigation,
}: {
  navigation: NavigationProps;
}) {
  // Colores del tema actual
  const { colors } = useThemeContext();

  // Historial completo (cada entrada guarda fecha y snapshot del presupuesto)
  const [items, setItems] = useState<HistoryEntry[]>([]);
  // Lista de ids marcados como favoritos (por date/id)
  const [favorites, setFavorites] = useState<string[]>([]);
  // Indicador de carga
  const [loading, setLoading] = useState(true);

  // Carga historial + favoritos y actualiza el estado (helper para refrescar pantalla)
  const loadAll = async () => {
    setLoading(true);
    try {
      // Obtiene historial y favoritos en paralelo
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
    // Evita setState después del unmount
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

    // Cleanup
    return () => {
      mounted = false;
    };
  }, []);

  //  Confirma y borra el historial (sin borrar presupuesto actual)
  const clearHistory = async () => {
    const ok = await confirmAction({
      title: "Borrar historial",
      message:
        "¿Seguro que deseas borrar el historial?\nNo borra tu presupuesto actual.",
      confirmText: "Borrar",
      cancelText: "Cancelar",
      destructive: true,
    });

    if (!ok) return;

    try {
      // Borra historial del storage y recarga estados
      await storage.clearHistory();
      await loadAll();
    } catch {
      showMessage("Error", "No se pudo borrar el historial");
    }
  };

  //  Favorito: agrega o quita un id de favoritos y actualiza el estado
  const onToggleFavorite = async (id: string) => {
    try {
      const next = await storage.toggleFavorite(id);
      setFavorites(next);
    } catch {
      showMessage("Error", "No se pudo actualizar favorito");
    }
  };

  //  Restaurar: confirma, setea el presupuesto actual y regresa a Home
  const onRestore = async (entry: HistoryEntry) => {
    const ok = await confirmAction({
      title: "Restaurar presupuesto",
      message:
        "¿Quieres restaurar este presupuesto como el actual?\nSe reemplazará el presupuesto actual.",
      confirmText: "Restaurar",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    try {
      // Guarda el snapshot elegido como presupuesto actual
      await storage.restore(entry.budget);

      //  Si tu navigation expone refreshHome, lo ejecuta (opcional)
      navigation.refreshHome?.();

      // Regresa a Home
      navigation.goBack();
    } catch {
      showMessage("Error", "No se pudo restaurar");
    }
  };

  // Ordena: favoritos primero, luego el resto (manteniendo orden relativo)
  const merged = useMemo(() => {
    const favSet = new Set(favorites);
    const favs = items.filter((x) => favSet.has(x.date));
    const rest = items.filter((x) => !favSet.has(x.date));
    return [...favs, ...rest];
  }, [items, favorites]);

  return (
    <SafeArea style={[styles.safe, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {/* Volver */}
        <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.85}>
          <AppText style={{ color: colors.primary, fontWeight: "900" }}>
            ← Volver
          </AppText>
        </TouchableOpacity>

        {/* Título */}
        <AppText style={[styles.title, { color: colors.text }]}>
          Historial
        </AppText>

        {/* Borrar historial */}
        <TouchableOpacity onPress={clearHistory} activeOpacity={0.85}>
          <AppText style={{ color: colors.danger, fontWeight: "900" }}>
            Borrar
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading ? (
        // Estado: cargando
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <AppText style={{ color: colors.textMuted, marginTop: 10 }}>
            Cargando historial...
          </AppText>
        </View>
      ) : merged.length === 0 ? (
        // Estado: vacío
        <View style={styles.center}>
          <AppText
            style={{
              color: colors.textMuted,
              textAlign: "center",
              paddingHorizontal: 16,
            }}
          >
            Aún no hay historial.
            {"\n"}Modifica el presupuesto y espera a que se guarde para crear
            registros.
          </AppText>
        </View>
      ) : (
        // Estado: lista con tarjetas
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {merged.map((it) => {
            // Total del snapshot
            const total = totalOf(it.budget);
            // Número de categorías raíz (hijos del presupuesto)
            const roots = (it.budget.children ?? []).length;
            // ¿es favorito?
            const isFav = favorites.includes(it.date);

            return (
              <View
                key={it.date}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Fila superior: fecha + estrella */}
                <View style={styles.rowBetween}>
                  <AppText style={{ color: colors.text, fontWeight: "900" }}>
                    {formatDate(it.date)}
                  </AppText>

                  {/* Toggle favorito */}
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

                {/* Resumen */}
                <AppText style={{ color: colors.textMuted, marginTop: 6 }}>
                  Total: ${total}
                </AppText>
                <AppText style={{ color: colors.textMuted, marginTop: 2 }}>
                  Categorías principales: {roots}
                </AppText>

                {/* Restaurar snapshot */}
                <TouchableOpacity
                  onPress={() => onRestore(it)}
                  activeOpacity={0.85}
                  style={[
                    styles.restoreBtn,
                    { backgroundColor: colors.primary },
                  ]}
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

// Estilos de la pantalla de historial
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
