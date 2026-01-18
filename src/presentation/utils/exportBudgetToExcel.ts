import { Platform, Alert } from "react-native";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { BudgetNode } from "../../domain/entities/BudgetNode";

function flatten(node: BudgetNode, level = 0, rows: any[] = []) {
  rows.push({
    Nivel: level,
    Categoria: node.name,
    Monto: node.amount,
  });

  node.children.forEach((c) => flatten(c, level + 1, rows));
  return rows;
}

export async function exportBudgetToExcel(root: BudgetNode) {
  try {
    const data = flatten(root);

    if (Platform.OS === "web") {
      exportWeb(data);
      return;
    }

    await exportNative(data);
  } catch (err) {
    console.error("EXPORT EXCEL ERROR:", err);
    Alert.alert("Error", "No se pudo exportar el presupuesto");
  }
}

function exportWeb(data: any[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "presupuesto.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

async function exportNative(data: any[]) {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert("No disponible", "Compartir no está disponible");
    return;
  }

  // ✅ Usar documentDirectory primero (más confiable en Expo Go)
  const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  if (!dir) {
    Alert.alert("Error", "FileSystem sin directorio disponible");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");

  const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

  const uri = dir + "presupuesto.xlsx";

  // ✅ NO usar EncodingType.Base64 (evita el crash en Expo Go)
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: "base64" as any });

  Alert.alert("Listo ✅", "Archivo generado, abriendo menú para compartir...");

  await Sharing.shareAsync(uri, {
    dialogTitle: "Exportar presupuesto",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    UTI: "com.microsoft.excel.xlsx",
  });
}
