import { del } from "@vercel/blob";

/**
 * Semua file disimpan sebagai blob PRIVATE; akses hanya lewat /api/files (terautentikasi).
 * BLOB_READ_WRITE_TOKEN dibaca otomatis oleh SDK di server dan tidak pernah dikirim ke browser.
 */
export const BLOB_ACCESS = "private" as const;

/** Hapus blob tanpa menggagalkan operasi utama; kegagalan dicatat untuk dibersihkan manual. */
export async function deleteBlobQuiet(
  pathname: string | undefined | null,
): Promise<void> {
  if (!pathname) return;
  try {
    await del(pathname);
  } catch (err) {
    console.error("[BLOB] gagal menghapus", pathname, err);
  }
}
