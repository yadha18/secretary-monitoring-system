import type { SortOrder } from "mongoose";

import { AppError } from "@/lib/errors";
import { parseDateOnly } from "@/lib/date";

export const EXPORT_MAX_ROWS = 10_000;

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Pencarian case-insensitive (substring) pada beberapa field. Input di-escape. */
export function searchFilter(q: string | undefined, fields: string[]) {
  if (!q) return null;
  const re = new RegExp(escapeRegex(q), "i");
  return { $or: fields.map((f) => ({ [f]: re })) };
}

/** Filter rentang tanggal-saja (inklusif) untuk satu field. */
export function dateRangeFilter(field: string, from?: string, to?: string) {
  if (!from && !to) return null;
  const range: Record<string, Date> = {};
  if (from) range.$gte = parseDateOnly(from);
  if (to) range.$lte = parseDateOnly(to);
  return { [field]: range };
}

/** Gabungkan kondisi non-null menjadi satu filter. */
export function combine(...conds: (Record<string, unknown> | null | undefined | false)[]) {
  const list = conds.filter(Boolean) as Record<string, unknown>[];
  return list.length ? { $and: list } : {};
}

/** Sort aman: hanya kolom whitelist; selalu ada tie-breaker _id agar paginasi stabil. */
export function buildSort(
  sort: string | undefined,
  order: "asc" | "desc",
  allowed: Record<string, string>,
  fallback: { field: string; order: "asc" | "desc" }
): Record<string, SortOrder> {
  const field = sort ? allowed[sort] : undefined;
  if (sort && !field) throw new AppError("VALIDATION_ERROR", "Kolom sort tidak valid.", { sort: "Tidak didukung." });
  const key = field ?? fallback.field;
  const dir = field ? order : fallback.order;
  return { [key]: dir === "asc" ? 1 : -1, _id: -1 };
}

export function pageMeta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
