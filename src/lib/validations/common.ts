import { z } from "zod";

import { PAGE_SIZES } from "@/lib/constants";

/** "YYYY-MM-DD" yang benar-benar ada di kalender. */
export const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Tanggal tidak valid.");

export const requiredDate = (msg: string) => z.string().min(1, msg).pipe(dateStr);
export const optionalDate = z.union([z.literal(""), dateStr]).optional().default("");

export const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(max, `${label} maksimal ${max} karakter.`);
export const optionalText = (max: number) =>
  z.string().trim().max(max, `Maksimal ${max} karakter.`).optional().default("");

const emailCheck = z.email();

export function isEmailList(value: string): boolean {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .every((v) => emailCheck.safeParse(v).success);
}

/** Normalisasi daftar email: huruf kecil, dipisah ", ". */
export function normalizeEmailList(value: string): string {
  return value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .join(", ");
}

/** Parameter list umum (server-side pagination, search, sort). */
export const listQueryBase = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((v) => (PAGE_SIZES as readonly number[]).includes(v), "pageSize tidak valid.")
    .default(10),
  q: z.string().trim().max(100).optional(),
  sort: z.string().max(40).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** Ubah URLSearchParams → objek, abaikan nilai kosong. */
export function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of params) if (v !== "") out[k] = v;
  return out;
}

export const idParam = z.string().regex(/^[a-f\d]{24}$/i, "ID tidak valid.");
