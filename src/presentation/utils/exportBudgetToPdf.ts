import { Alert, Platform } from "react-native";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { BudgetNode } from "../../domain/entities/BudgetNode";

/* ---------------- FLATTEN TREE ---------------- */
function flatten(node: BudgetNode, level = 0, rows: any[] = []) {
  rows.push({
    level,
    name: node.name,
    amount: node.amount,
    id: node.id,
  });

  node.children.forEach((c) => flatten(c, level + 1, rows));
  return rows;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(n: number) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

/* ---------------- HTML TEMPLATE ---------------- */
function buildHtml(root: BudgetNode) {
  const rows = flatten(root);

  const tableRows = rows
    .map((r) => {
      const indent = r.level * 16;
      return `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            <div style="margin-left:${indent}px;">
              ${escapeHtml(r.name)}
              <div style="color:#888; font-size:11px;">${escapeHtml(r.id)}</div>
            </div>
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; white-space:nowrap;">
            ${formatMoney(r.amount)}
          </td>
        </tr>
      `;
    })
    .join("");

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

      <div class="footer">
        Nota: este PDF lista los montos capturados por nodo (amount). Si quieres totales calculados por categoría, lo ajusto.
      </div>
    </body>
  </html>
  `;
}

/* ---------------- PUBLIC API ---------------- */
export async function exportBudgetToPDF(root: BudgetNode) {
  const html = buildHtml(root);

  // ✅ WEB: abre el diálogo de impresión (desde ahí “Guardar como PDF”)
  if (Platform.OS === "web") {
    const w = window.open("", "_blank");
    if (!w) {
      Alert.alert("Error", "No se pudo abrir la ventana para imprimir.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    return;
  }

  // ✅ EXPO GO (Android/iOS): genera PDF real y comparte
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare =
    Sharing?.isAvailableAsync ? await Sharing.isAvailableAsync() : false;

  if (!canShare) {
    Alert.alert("PDF generado", `Se generó el PDF en:\n${uri}`);
    return;
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: "Exportar PDF",
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });

  Alert.alert("Éxito", "PDF exportado correctamente ✅");
}
