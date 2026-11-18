import { NextResponse } from "next/server";
import { readId, readJson, route } from "@/lib/api";
import type { FileModule } from "@/lib/file-rules";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { attachFileSchema } from "@/lib/validations/file";
import { assertTmpPath, attachFile, removeFile } from "@/services/file.service";

const ACTION = { ams: "ams_document", incoming: "incoming_document" } as const;

/** Handler PUT (daftarkan/ganti file) dan DELETE (hapus file) untuk /api/<modul>/[id]/file. */
export function fileRouteHandlers(module: FileModule) {
  const PUT = route(async (req, ctx) => {
    const user = await requireUser(`${ACTION[module]}:update`);
    // Validasi murah dulu (tanpa database), baru rate limit dan proses.
    const id = await readId(ctx);
    const input = await readJson(req, attachFileSchema);
    assertTmpPath(module, input.pathname);
    await enforceRateLimit(`file-attach:${user.id}`, 30, 60);
    return NextResponse.json({ data: await attachFile(module, id, input) });
  });

  const DELETE = route(async (_req, ctx) => {
    await requireUser(`${ACTION[module]}:update`);
    await removeFile(module, await readId(ctx));
    return NextResponse.json({ ok: true });
  });

  return { PUT, DELETE };
}
