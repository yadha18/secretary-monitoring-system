import ExcelJS from "exceljs";

import { formatDateID } from "@/lib/date";

export type ExportColumn<T> = { header: string; width?: number; value: (row: T) => string | number };

export type ExportFormat = "csv" | "xlsx";

/** Cegah CSV/Excel formula injection: sel berawalan = + - @ diawali tanda kutip. */
function safeCell(v: string | number): string | number {
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(v)) return `'${v}`;
  return v;
}

export const dateCell = (v: string) => (v ? formatDateID(v) : "");

function csvEscape(v: string | number): string {
  const s = String(safeCell(v));
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function buildExportResponse<T>(
  format: ExportFormat,
  baseName: string,
  columns: ExportColumn<T>[],
  rows: T[]
): Promise<Response> {
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${baseName}-${stamp}.${format}`;
  const headers = { "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" };

  if (format === "csv") {
    const lines = [columns.map((c) => csvEscape(c.header)).join(",")];
    for (const r of rows) lines.push(columns.map((c) => csvEscape(c.value(r))).join(","));
    const body = "﻿" + lines.join("\r\n"); // BOM agar Excel membaca UTF-8
    return new Response(body, { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" } });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(baseName.slice(0, 31));
  ws.columns = columns.map((c) => ({ header: c.header, width: c.width ?? 18 }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF17365D" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  for (const r of rows) ws.addRow(columns.map((c) => safeCell(c.value(r))));
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      ...headers,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
