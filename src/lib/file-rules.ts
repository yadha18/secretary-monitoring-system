import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/constants";

/** Dipakai bersama oleh browser (validasi awal) dan server (validasi wajib). */
export const FILE_MODULES = ["ams", "incoming"] as const;
export type FileModule = (typeof FILE_MODULES)[number];

export const MIME_BY_EXT: Record<string, (typeof ALLOWED_FILE_TYPES)[number]> =
  {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
  };

export const FILE_ACCEPT = ALLOWED_FILE_EXTENSIONS.join(",");
export const MAX_FILE_MB = MAX_FILE_SIZE / (1024 * 1024);

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/** Buang path, karakter kontrol & simbol berbahaya; batasi panjang; pertahankan ekstensi. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const ext = extOf(base);
  const stem = base
    .slice(0, base.length - ext.length)
    .replace(/[\u0000-\u001f<>:"|?*\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "")
    .slice(0, 100);
  return `${stem || "file"}${ext}`;
}

export function tmpPrefix(module: FileModule): string {
  return `tmp/${module}/`;
}

/** Pesan error bila file tidak boleh diunggah; null bila lolos. */
export function validateFileMeta(file: {
  name: string;
  size: number;
}): string | null {
  if (!(extOf(file.name) in MIME_BY_EXT))
    return "Format file harus PDF, JPG, JPEG, atau PNG.";
  if (file.size <= 0) return "File kosong.";
  if (file.size > MAX_FILE_SIZE)
    return `Ukuran file maksimal ${MAX_FILE_MB} MB.`;
  return null;
}

/** Deteksi tipe sebenarnya dari byte awal (magic bytes), bukan dari nama/header klien. */
export function detectMime(
  b: Uint8Array,
): (typeof ALLOWED_FILE_TYPES)[number] | null {
  if (
    b.length >= 5 &&
    b[0] === 0x25 &&
    b[1] === 0x50 &&
    b[2] === 0x44 &&
    b[3] === 0x46 &&
    b[4] === 0x2d
  ) {
    return "application/pdf"; // %PDF-
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return "image/jpeg";
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return "image/png";
  }
  return null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
