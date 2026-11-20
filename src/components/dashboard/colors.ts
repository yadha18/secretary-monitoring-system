/**
 * Warna grafik. Status memakai warna semantik tetap (selalu disertai label); seri kategori
 * (Divisi, AMS vs Dokumen Masuk) memakai palet yang lolos validasi CVD & kontras (terang/gelap).
 */
export const STATUS_COLORS: Record<string, string> = {
  // Action Tracker
  "On Progress": "#2563EB",
  Done: "#16A34A",
  // Dokumen
  "Belum dimulai": "#94A3B8",
  "Dalam proses": "#2563EB",
  Diblokir: "#F59E0B",
  Selesai: "#16A34A",
  // Prioritas
  Tinggi: "#DC2626",
  Normal: "#94A3B8",
};

export const SERIES = { blue: "#2563EB", orange: "#EA580C", teal: "#0D9488" } as const;

export const DEPARTMENT_COLORS: Record<string, string> = {
  ADKINTEL: SERIES.blue,
  PSPE: SERIES.orange,
  ADEV: SERIES.teal,
};

export const DEADLINE_COLORS: Record<string, string> = {
  Terlambat: "#DC2626",
  "0–7 hari": "#F59E0B",
  "8–30 hari": "#2563EB",
  "> 30 hari": "#2563EB",
  "Tanpa deadline": "#94A3B8",
};

export const AXIS = { tick: "#64748B", grid: "#E2E8F0" } as const;

export const fmtNumber = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export function fmtMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", month: "short", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, 1))
  );
}

/** Label bulan ringkas: "Jan" bila semua bulan di tahun yang sama, "Jan 26" bila lintas tahun. */
export function fmtMonthShort(ym: string, withYear: boolean) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  const month = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", month: "short" }).format(d);
  return withYear ? `${month} ${String(y).slice(2)}` : month;
}