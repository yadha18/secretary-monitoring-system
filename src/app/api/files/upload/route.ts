import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { route } from "@/lib/api";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { FILE_MODULES, tmpPrefix, validateFileMeta } from "@/lib/file-rules";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";

/**
 * Menerbitkan token upload langsung (browser → Vercel Blob). File tidak melewati server ini,
 * sehingga tidak terkena batas body serverless. Token dibatasi tipe, ukuran, dan lokasi tmp/.
 */
export const POST = route(async (req) => {
  const user = await requireUser("ams_document:update"); // admin (akses penuh) untuk v1
  const body = (await req.json()) as HandleUploadBody;

  const result = await handleUpload({
    request: req,
    body,
    onBeforeGenerateToken: async (pathname) => {
      await enforceRateLimit(`file-token:${user.id}`, 30, 60);

      const okPrefix = FILE_MODULES.some((m) =>
        pathname.startsWith(tmpPrefix(m)),
      );
      if (!okPrefix || pathname.includes(".."))
        throw new AppError("VALIDATION_ERROR", "Lokasi upload tidak valid.");
      // Ukuran belum diketahui di sini (dibatasi maximumSizeInBytes); cek ekstensi saja.
      const problem = validateFileMeta({ name: pathname, size: 1 });
      if (problem) throw new AppError("VALIDATION_ERROR", problem);

      return {
        allowedContentTypes: [...ALLOWED_FILE_TYPES],
        maximumSizeInBytes: MAX_FILE_SIZE,
        addRandomSuffix: false,
        allowOverwrite: false,
        validUntil: Date.now() + 10 * 60 * 1000,
      };
    },
  });

  return NextResponse.json(result);
});
