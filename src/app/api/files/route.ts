import { route, readQuery } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { fileQuerySchema } from "@/lib/validations/file";
import { openFile } from "@/services/file.service";

/** Preview/unduh file lewat sesi login (blob private tidak punya URL publik). */
export const GET = route(async (req) => {
  await requireUser("ams_document:read");
  const { module, id, disposition } = readQuery(req, fileQuerySchema);
  const { meta, stream } = await openFile(module, id);

  const ascii = meta.fileName
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");
  return new Response(stream, {
    headers: {
      "Content-Type": meta.mimeType,
      "Content-Length": String(meta.fileSize),
      "Content-Disposition": `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(meta.fileName)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});
