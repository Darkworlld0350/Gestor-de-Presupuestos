import { Alert, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { BudgetNode } from "../../domain/entities/BudgetNode";

/* ---------------- TOTAL CALCULADO ---------------- */
// Calcula el total de un nodo sumando recursivamente los montos de sus hojas
function calcTotal(node: BudgetNode): number {
  const children = node.children ?? [];
  // Nodo hoja: retorna el monto capturado
  if (children.length === 0) return Number(node.amount) || 0;
  // Nodo padre: suma los totales de sus hijos
  return children.reduce((sum, c) => sum + calcTotal(c), 0);
}

/* ---------------- FLATTEN TREE (con totales) ---------------- */
// Convierte el árbol jerárquico en filas planas para exportación (CSV)
// Incluye nivel, tipo (raíz/categoría/subcategoría), monto capturado y total calculado
function flatten(node: BudgetNode, level = 0, rows: any[] = []) {
  const children = node.children ?? [];
  const isLeaf = children.length === 0;

  const amount = Number(node.amount) || 0;
  const total = calcTotal(node);

  // Agrega una fila representando el nodo actual
  rows.push({
    Nivel: level,
    Tipo: level === 0 ? "Presupuesto" : isLeaf ? "Subcategoría" : "Categoría",
    Categoria: node.name,
    // Solo las hojas tienen monto capturado editable
    "Monto (capturado)": isLeaf ? amount : "",
    // Todos los nodos tienen total calculado
    "Total (calculado)": total,
    Id: node.id,
  });

  // Recorre recursivamente los hijos aumentando el nivel
  children.forEach((c) => flatten(c, level + 1, rows));
  return rows;
}

/* ---------------- JSON -> CSV ---------------- */
// Convierte un arreglo de objetos (rows) a contenido CSV
function jsonToCsv(rows: any[], headers?: string[]) {
  // Si no hay filas, retorna vacío
  if (!Array.isArray(rows) || rows.length === 0) return "";

  // Define columnas: usa headers si vienen, si no usa llaves del primer objeto
  const cols =
    Array.isArray(headers) && headers.length > 0
      ? headers
      : Object.keys(rows[0]);

  // Escapa valores para CSV (comillas, comas y saltos de línea)
  const escape = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    // Si contiene coma, salto de línea o comillas, se envuelve en comillas
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  // Construye línea de encabezados
  const headerLine = cols.map(escape).join(",");

  // Construye líneas de datos en el mismo orden de columnas
  const dataLines = rows.map((row) =>
    cols.map((c) => escape(row?.[c])).join(",")
  );

  // Une todo con saltos de línea
  return [headerLine, ...dataLines].join("\n");
}

/* ---------------- WEB EXPORT ---------------- */
// Exportación en web: crea un Blob y dispara la descarga mediante un <a>
function exportWebCsv(csvContent: string, fileName: string) {
  // Asegura extensión .csv
  const safeName = fileName.toLowerCase().endsWith(".csv")
    ? fileName
    : `${fileName}.csv`;

  // Crea el archivo como Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Crea un link temporal para descargar
  const link = document.createElement("a");
  link.href = url;
  link.download = safeName;
  link.click();

  // Libera el recurso
  URL.revokeObjectURL(url);
}

/* ---------------- EXPO GO EXPORT (NATIVE) ---------------- */
// Exportación en móvil: escribe el archivo en documentDirectory y comparte si es posible
async function exportNativeCsv(csvContent: string, fileName: string) {
  // Asegura extensión .csv
  const safeName = fileName.toLowerCase().endsWith(".csv")
    ? fileName
    : `${fileName}.csv`;

  // Obtiene directorio de documentos del dispositivo
  const dir = FileSystem.documentDirectory;
  if (!dir) {
    throw new Error("documentDirectory no disponible (expo-file-system/legacy)");
  }

  // Ruta final del archivo
  const fileUri = dir + safeName;

  // Escribe el contenido CSV como UTF-8
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Verifica si el sistema permite compartir
  const canShare =
    Sharing?.isAvailableAsync ? await Sharing.isAvailableAsync() : false;

  // Si no se puede compartir, al menos informa dónde quedó guardado
  if (!canShare) {
    Alert.alert(
      "Guardado",
      `Archivo guardado en:\n${fileUri}\n\n(Sharing no disponible)`
    );
    return;
  }

  // Abre el diálogo de compartir/guardar/mandar archivo
  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Exportar CSV",
    UTI: "public.comma-separated-values-text",
  });
}

/* ---------------- PUBLIC API ---------------- */
// API pública: genera el CSV desde el árbol y lo exporta según plataforma
export async function exportBudgetToCSV(
  root: BudgetNode,
  fileName = "presupuesto.csv"
) {
  // Genera filas planas del árbol
  const rows = flatten(root);

  // Si no hay filas, no exporta
  if (!rows || rows.length === 0) {
    Alert.alert("Sin datos", "No hay información para exportar.");
    return;
  }

  // Encabezados fijos para mantener orden y nombres
  const headers = [
    "Nivel",
    "Tipo",
    "Categoria",
    "Monto (capturado)",
    "Total (calculado)",
    "Id",
  ];

  // Genera contenido CSV
  const csvContent = jsonToCsv(rows, headers);

  try {
    // En web descarga directa
    if (Platform.OS === "web") {
      exportWebCsv(csvContent, fileName);
      return;
    }

    // En móvil, guarda y comparte
    await exportNativeCsv(csvContent, fileName);
    Alert.alert("Éxito", "CSV exportado correctamente ✅");
  } catch (error: any) {
    // Log en consola para depuración
    console.error("Error exportando CSV:", error);
    // Mensaje amigable al usuario
    Alert.alert(
      "Error al exportar",
      error?.message ? String(error.message) : "Ocurrió un error desconocido."
    );
  }
}
