import { toWibYmd } from "@/lib/date";

/**
 * Definisi periode dashboard (satu sumber kebenaran, kalender WIB / Asia/Jakarta):
 *  - today  : hari ini
 *  - week   : Senin–Minggu pada minggu berjalan
 *  - month  : tanggal 1 sampai akhir bulan berjalan
 *  - year   : 1 Januari sampai 31 Desember tahun berjalan
 *  - custom : from–to (inklusif), maksimal 5 tahun
 * Filter memakai: Action Tracker → Tanggal Rapat/Instruksi; AMS & Dokumen Masuk → Tanggal Terima.
 * Aktivitas terbaru memakai waktu perubahan (updatedAt) dalam batas hari WIB yang sama.
 */
export const DASHBOARD_RANGES = ["today", "week", "month", "year", "custom"] as const;
export type DashboardRangeKey = (typeof DASHBOARD_RANGES)[number];

export const RANGE_LABEL: Record<DashboardRangeKey, string> = {
  today: "Hari ini",
  week: "Minggu ini",
  month: "Bulan ini",
  year: "Tahun ini",
  custom: "Rentang kustom",
};

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_CUSTOM_DAYS = 366 * 5;

export type ResolvedRange = {
  key: DashboardRangeKey;
  from: string; // YYYY-MM-DD (inklusif)
  to: string; // YYYY-MM-DD (inklusif)
  fromDate: Date; // UTC 00:00 (untuk field tanggal-saja)
  toDate: Date; // UTC 00:00 (inklusif)
  startInstant: Date; // 00:00 WIB hari pertama
  endInstant: Date; // 00:00 WIB sehari setelah hari terakhir (eksklusif)
};

const toUtc = (ymd: string) => new Date(`${ymd}T00:00:00.000Z`);
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (ymd: string, n: number) => fmt(new Date(toUtc(ymd).getTime() + n * DAY_MS));

export function resolveRange(
  key: DashboardRangeKey,
  custom?: { from?: string; to?: string },
  now: Date = new Date()
): ResolvedRange {
  const today = toWibYmd(now);
  let from = today;
  let to = today;

  if (key === "week") {
    const dow = toUtc(today).getUTCDay(); // 0=Minggu
    const sinceMonday = (dow + 6) % 7;
    from = addDays(today, -sinceMonday);
    to = addDays(from, 6);
  } else if (key === "month") {
    const [y, m] = today.split("-").map(Number);
    from = `${y}-${String(m).padStart(2, "0")}-01`;
    to = fmt(new Date(Date.UTC(y, m, 0))); // hari ke-0 bulan berikutnya = akhir bulan ini
  } else if (key === "year") {
    const y = today.slice(0, 4);
    from = `${y}-01-01`;
    to = `${y}-12-31`;
  } else if (key === "custom") {
    if (!custom?.from || !custom?.to) throw new Error("Rentang kustom membutuhkan from dan to.");
    from = custom.from;
    to = custom.to;
    if (from > to) throw new Error("Tanggal awal tidak boleh setelah tanggal akhir.");
    if ((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS > MAX_CUSTOM_DAYS) {
      throw new Error("Rentang kustom maksimal 5 tahun.");
    }
  }

  return {
    key,
    from,
    to,
    fromDate: toUtc(from),
    toDate: toUtc(to),
    startInstant: new Date(toUtc(from).getTime() - WIB_OFFSET_MS),
    endInstant: new Date(toUtc(addDays(to, 1)).getTime() - WIB_OFFSET_MS),
  };
}

/** Daftar bulan "YYYY-MM" yang tercakup rentang (untuk mengisi bulan kosong dengan 0). */
export function monthsInRange(from: string, to: string): string[] {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

export { addDays as addDaysYmd };