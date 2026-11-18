import { randomUUID } from "node:crypto";

import { BlobNotFoundError, copy, get, head } from "@vercel/blob";
import type { Model } from "mongoose";

import { BLOB_ACCESS, deleteBlobQuiet } from "@/lib/blob";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import {
  detectMime,
  extOf,
  MIME_BY_EXT,
  sanitizeFileName,
  tmpPrefix,
  validateFileMeta,
  type FileModule,
} from "@/lib/file-rules";
import { connectDB } from "@/lib/mongodb";
import { AmsDocument } from "@/models/AmsDocument";
import { IncomingDocument } from "@/models/IncomingDocument";
import type { FileMeta } from "@/models/_shared";
import type { FileDto } from "@/types";

type WithFile = { file?: FileMeta | null };
type Doc = WithFile & { save(): Promise<unknown> };

const MODELS: Record<FileModule, Model<WithFile>> = {
  ams: AmsDocument as unknown as Model<WithFile>,
  incoming: IncomingDocument as unknown as Model<WithFile>,
};

const LABEL: Record<FileModule, string> = {
  ams: "Dokumen AMS",
  incoming: "Dokumen masuk",
};

export const toFileDto = (f: FileMeta): FileDto => ({
  fileName: f.fileName,
  mimeType: f.mimeType,
  fileSize: f.fileSize,
  uploadedAt: new Date(f.uploadedAt).toISOString(),
});

async function findDoc(module: FileModule, id: string): Promise<Doc> {
  await connectDB();
  const doc = (await MODELS[module].findById(id)) as Doc | null;
  if (!doc)
    throw new AppError("NOT_FOUND", `${LABEL[module]} tidak ditemukan.`);
  return doc;
}

/** Baca byte awal blob (untuk deteksi tipe) lalu hentikan stream. */
async function readHead(pathname: string, length = 16): Promise<Uint8Array> {
  const res = await get(pathname, { access: BLOB_ACCESS, useCache: false });
  if (!res || res.statusCode !== 200)
    throw new AppError("VALIDATION_ERROR", "File upload tidak ditemukan.");
  const reader = res.stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < length) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      total += value.length;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const out = new Uint8Array(Math.min(total, length));
  let off = 0;
  for (const c of chunks) {
    const take = Math.min(c.length, out.length - off);
    out.set(c.subarray(0, take), off);
    off += take;
    if (off >= out.length) break;
  }
  return out;
}

/** Lokasi upload sementara harus di tmp/<modul>/ dan tanpa traversal. */
export function assertTmpPath(module: FileModule, pathname: string): void {
  if (!pathname.startsWith(tmpPrefix(module)) || pathname.includes("..")) {
    throw new AppError("VALIDATION_ERROR", "Lokasi file tidak valid.", {
      pathname: "Tidak valid.",
    });
  }
}

/**
 * Daftarkan file hasil upload langsung (tmp/...) ke dokumen:
 * verifikasi → pindah ke path final → simpan metadata → hapus tmp & file lama.
 */
export async function attachFile(
  module: FileModule,
  id: string,
  input: { pathname: string; fileName: string },
): Promise<FileDto> {
  const { pathname } = input;
  assertTmpPath(module, pathname);
  const doc = await findDoc(module, id);

  let info;
  try {
    info = await head(pathname);
  } catch (err) {
    if (err instanceof BlobNotFoundError)
      throw new AppError("VALIDATION_ERROR", "File upload tidak ditemukan.");
    throw err;
  }

  const fileName = sanitizeFileName(input.fileName);
  const problem = validateFileMeta({ name: fileName, size: info.size });
  if (problem) {
    await deleteBlobQuiet(pathname);
    throw new AppError("VALIDATION_ERROR", problem);
  }

  // Tipe sebenarnya (magic bytes) harus sesuai ekstensi.
  const detected = detectMime(await readHead(pathname));
  if (!detected || detected !== MIME_BY_EXT[extOf(fileName)]) {
    await deleteBlobQuiet(pathname);
    throw new AppError(
      "VALIDATION_ERROR",
      "Isi file tidak sesuai dengan formatnya (PDF, JPG, JPEG, atau PNG).",
    );
  }
  if (info.size > MAX_FILE_SIZE) {
    await deleteBlobQuiet(pathname);
    throw new AppError("VALIDATION_ERROR", "Ukuran file melebihi batas.");
  }

  const finalPath = `${module}/${id}/${randomUUID()}-${fileName}`;
  const copied = await copy(pathname, finalPath, {
    access: BLOB_ACCESS,
    contentType: detected,
    addRandomSuffix: false,
  });
  await deleteBlobQuiet(pathname);

  const previous = doc.file ?? null;
  doc.file = {
    fileName,
    fileUrl: copied.url,
    blobPathname: copied.pathname,
    mimeType: detected,
    fileSize: info.size,
    uploadedAt: new Date(),
  };

  try {
    await doc.save();
  } catch (err) {
    await deleteBlobQuiet(copied.pathname); // jangan tinggalkan file yatim
    throw err;
  }

  // Metadata baru sudah tersimpan → baru hapus file lama.
  await deleteBlobQuiet(previous?.blobPathname);
  return toFileDto(doc.file);
}

export async function removeFile(
  module: FileModule,
  id: string,
): Promise<void> {
  const doc = await findDoc(module, id);
  const previous = doc.file ?? null;
  if (!previous)
    throw new AppError("NOT_FOUND", "Dokumen ini belum memiliki file.");
  doc.file = undefined;
  await doc.save();
  await deleteBlobQuiet(previous.blobPathname);
}

/** Dipanggil saat dokumen dihapus. */
export async function deleteFileOf(
  file: { blobPathname?: string | null } | null | undefined,
) {
  await deleteBlobQuiet(file?.blobPathname);
}

export async function openFile(module: FileModule, id: string) {
  const doc = await findDoc(module, id);
  if (!doc.file)
    throw new AppError("NOT_FOUND", "Dokumen ini belum memiliki file.");
  const res = await get(doc.file.blobPathname, {
    access: BLOB_ACCESS,
    useCache: false,
  });
  if (!res || res.statusCode !== 200)
    throw new AppError("NOT_FOUND", "File tidak ditemukan di penyimpanan.");
  return { meta: doc.file, stream: res.stream };
}
