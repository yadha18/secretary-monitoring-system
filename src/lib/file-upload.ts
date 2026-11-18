import { upload } from "@vercel/blob/client";
import { apiFetch } from "@/lib/api-client";
import {
  MIME_BY_EXT,
  extOf,
  sanitizeFileName,
  validateFileMeta,
  type FileModule,
} from "@/lib/file-rules";
import type { FileDto } from "@/types";

const API_BASE: Record<FileModule, string> = {
  ams: "/api/ams-documents",
  incoming: "/api/incoming-documents",
};

export function fileUrl(
  module: FileModule,
  id: string,
  disposition: "inline" | "attachment",
) {
  return `/api/files?module=${module}&id=${id}&disposition=${disposition}`;
}

/** Upload langsung ke Blob (tmp/), lalu minta server memverifikasi dan mengikatnya ke dokumen. */
export async function uploadAndAttach(
  module: FileModule,
  id: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<FileDto> {
  const problem = validateFileMeta(file);
  if (problem) throw new Error(problem);

  const safeName = sanitizeFileName(file.name);
  const blob = await upload(
    `tmp/${module}/${crypto.randomUUID()}-${safeName}`,
    file,
    {
      access: "private",
      handleUploadUrl: "/api/files/upload",
      contentType: MIME_BY_EXT[extOf(safeName)],
      onUploadProgress: ({ percentage }) =>
        onProgress?.(Math.round(percentage)),
    },
  );

  const res = await apiFetch<{ data: FileDto }>(
    `${API_BASE[module]}/${id}/file`,
    {
      method: "PUT",
      json: { pathname: blob.pathname, fileName: safeName },
    },
  );
  return res.data;
}

export async function deleteAttachedFile(
  module: FileModule,
  id: string,
): Promise<void> {
  await apiFetch(`${API_BASE[module]}/${id}/file`, { method: "DELETE" });
}
