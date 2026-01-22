import { Alert, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { BudgetNode } from "../../domain/entities/BudgetNode";

/* ---------------- HELPERS ---------------- */
// Escapa caracteres especiales para evitar romper el HTML (y prevenir inyección básica)
function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Da formato de dinero a un número (2 decimales)
function formatMoney(n: number) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

/** ✅ total real (si es hoja => amount, si es padre => suma recursiva) */
// Calcula el total del nodo: si es hoja usa amount, si es padre suma totales de hijos
function calcTotal(node: BudgetNode): number {
  const children = node.children ?? [];
  if (children.length === 0) return Number(node.amount) || 0;
  return children.reduce((sum, c) => sum + calcTotal(c), 0);
}

/** flatten pero guardando amount real y total calculado */
// Convierte el árbol en una lista plana de filas, conservando nivel e info necesaria para la tabla
function flatten(
  node: BudgetNode,
  level = 0,
  rows: Array<{
    level: number;
    name: string;
    id: string;
    amount: number; // amount capturado (solo hojas)
    total: number;  // total calculado (padres/hojas)
    isLeaf: boolean;
  }> = []
) {
  const children = node.children ?? [];
  const isLeaf = children.length === 0;

  // Agrega fila del nodo actual
  rows.push({
    level,
    name: node.name,
    id: node.id,
    amount: Number(node.amount) || 0,
    total: calcTotal(node),
    isLeaf,
  });

  // Recorre recursivamente los hijos aumentando el nivel
  children.forEach((c) => flatten(c, level + 1, rows));
  return rows;
}

/* ---------------- HTML TEMPLATE ---------------- */
// Construye el HTML completo que se imprimirá/convertirá a PDF
function buildHtml(root: BudgetNode) {
  // Genera filas planas del árbol
  const rows = flatten(root);

  // Genera las filas <tr> de la tabla
  const tableRows = rows
    .map((r) => {
      // Indentación visual según nivel
      const indent = r.level * 16;

      // ✅ Valor mostrado:
      // - hojas => amount capturado
      // - padres => total calculado
      const shownValue = r.isLeaf ? r.amount : r.total;

      // Estilo para distinguir visualmente padres vs hojas
      const nameStyle = r.isLeaf ? "font-weight:600;" : "font-weight:800;";
      const valueStyle = r.isLeaf ? "font-weight:600;" : "font-weight:900;";

      return `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            <div style="margin-left:${indent}px; ${nameStyle}">
              ${escapeHtml(r.name)}
              <div style="color:#888; font-size:11px; font-weight:400;">
                ${escapeHtml(r.id)}
              </div>
            </div>
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; white-space:nowrap; ${valueStyle}">
            ${formatMoney(shownValue)}
          </td>
        </tr>
      `;
    })
    .join("");

  // Total general del presupuesto (raíz)
  const grandTotal = calcTotal(root);

  // HTML completo con estilos embebidos (ideal para Print.printToFileAsync)
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 6px 0; font-size: 22px; }
        .sub { color: #666; margin-bottom: 18px; }
        table { width:100%; border-collapse: collapse; }
        th { text-align:left; padding:10px; background:#f6f7f9; border-bottom:1px solid #e5e7eb; }
        .right { text-align:right; }
        .totalBox {
          margin-top: 14px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #f9fafb;
          display:flex;
          justify-content: space-between;
          font-weight: 900;
        }
        .footer { margin-top:18px; color:#888; font-size:12px; }
      </style>
    </head>
    <body>
      <h1>Presupuesto</h1>
      <div class="sub">Exportado desde la app</div>

      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th class="right">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="totalBox">
        <div>Total general</div>
        <div>${formatMoney(grandTotal)}</div>
      </div>
    </body>
  </html>
  `;
}

/* ---------------- PUBLIC API ---------------- */
// Exporta el presupuesto a PDF dependiendo de la plataforma (web vs nativo)
export async function exportBudgetToPDF(root: BudgetNode) {
  // Construye el HTML a imprimir/convertir
  const html = buildHtml(root);

  // ✅ WEB: abre una pestaña y usa el diálogo de impresión (Guardar como PDF)
  if (Platform.OS === "web") {
    const w = window.open("", "_blank");
    if (!w) {
      Alert.alert("Error", "No se pudo abrir la ventana para imprimir.");
      return;
    }

    // Escribe el HTML y dispara impresión
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    return;
  }

  // ✅ NATIVE (Expo): genera un PDF a partir del HTML
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // Verifica si se puede compartir en el dispositivo
  const canShare =
    Sharing?.isAvailableAsync ? await Sharing.isAvailableAsync() : false;

  // Si no se puede compartir, muestra dónde quedó el archivo
  if (!canShare) {
    Alert.alert("PDF generado", `Se generó el PDF en:\n${uri}`);
    return;
  }

  // Abre el diálogo de compartir el PDF
  await Sharing.shareAsync(uri, {
    dialogTitle: "Exportar PDF",
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });

  // Confirma al usuario
  Alert.alert("Éxito", "PDF exportado correctamente ✅");
}
