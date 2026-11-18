/**
 * Konvensi tanggal-saja: disimpan sebagai Date UTC 00:00 dari tanggal kalender WIB (Asia/Jakarta),
 * sehingga tidak bergeser hari ketika dibaca di zona waktu mana pun.
 */
export const APP_TIME_ZONE = "Asia/Jakarta";

const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" untuk sebuah instant, menurut kalender WIB. */
export function toWibYmd(date: Date = new Date()): string {
  return ymdFormatter.format(date);
}

/** Hari ini (WIB) sebagai Date UTC 00:00. */
export function todayDateOnly(now: Date = new Date()): Date {
  return parseDateOnly(toWibYmd(now));
}

/** "YYYY-MM-DD" → Date UTC 00:00. Melempar error bila format/tanggal tidak valid. */
export function parseDateOnly(ymd: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) throw new Error(`Format tanggal tidak valid: ${ymd}`);
  const d = new Date(`${ymd}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== ymd) {
    throw new Error(`Tanggal tidak valid: ${ymd}`);
  }
  return d;
}

/** Date UTC 00:00 → "YYYY-MM-DD" (untuk input form). */
export function formatDateOnly(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

/** Tampilan Indonesia, contoh: 18 Nov 2026. */
export function formatDateID(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Overdue bila batas waktu sudah lewat (sebelum hari ini WIB) dan belum selesai. */
export function isOverdue(due: Date | string | null | undefined, done: boolean, now: Date = new Date()): boolean {
  if (!due || done) return false;
  return new Date(due).getTime() < todayDateOnly(now).getTime();
}
