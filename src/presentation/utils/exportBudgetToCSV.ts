import { Alert, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { BudgetNode } from "../../domain/entities/BudgetNode";

/* ---------------- FLATTEN TREE ---------------- */
function flatten(node: BudgetNode, level = 0, rows: any[] = []) {
  rows.push({
    Nivel: level,
    Categoria: node.name,
    Monto: node.amount,
    Id: node.id,
  });

  node.children.forEach((c) => flatten(c, level + 1, rows));
  return rows;
}

/* ---------------- JSON -> CSV ---------------- */
function jsonToCsv(rows: any[], headers?: string[]) {
  if (!Array.isArray(rows) || rows.length === 0) return "";

  const cols =
    Array.isArray(headers) && headers.length > 0
      ? headers
      : Object.keys(rows[0]);

  const escape = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  const headerLine = cols.map(escape).join(",");
  const dataLines = rows.map((row) =>
    cols.map((c) => escape(row?.[c])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

/* ---------------- WEB EXPORT ---------------- */
function exportWebCsv(csvContent: string, fileName: string) {
  const safeName = fileName.toLowerCase().endsWith(".csv")
    ? fileName
    : `${fileName}.csv`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = safeName;
  link.click();

  URL.revokeObjectURL(url);
}

/* ---------------- EXPO GO EXPORT (NATIVE) ---------------- */
async function exportNativeCsv(csvContent: string, fileName: string) {
  const safeName = fileName.toLowerCase().endsWith(".csv")
    ? fileName
    : `${fileName}.csv`;

  const dir = FileSystem.documentDirectory;
  if (!dir) {
    throw new Error("documentDirectory no disponible (expo-file-system/legacy)");
  }

  const fileUri = dir + safeName;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare =
    Sharing?.isAvailableAsync ? await Sharing.isAvailableAsync() : false;

  if (!canShare) {
    Alert.alert(
      "Guardado",
      `Archivo guardado en:\n${fileUri}\n\n(Sharing no disponible)`
    );
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Exportar CSV",
    UTI: "public.comma-separated-values-text",
  });
}

/* ---------------- PUBLIC API ---------------- */
export async function exportBudgetToCSV(root: BudgetNode, fileName = "presupuesto.csv") {
  const rows = flatten(root);

  if (!rows || rows.length === 0) {
    Alert.alert("Sin datos", "No hay información para exportar.");
    return;
  }

  const csvContent = jsonToCsv(rows, ["Nivel", "Categoria", "Monto", "Id"]);

  try {
    if (Platform.OS === "web") {
      exportWebCsv(csvContent, fileName);
      return;
    }

    await exportNativeCsv(csvContent, fileName);
    Alert.alert("Éxito", "CSV exportado correctamente ✅");
  } catch (error: any) {
    console.error("Error exportando CSV:", error);
    Alert.alert(
      "Error al exportar",
      error?.message ? String(error.message) : "Ocurrió un error desconocido."
    );
  }
}
