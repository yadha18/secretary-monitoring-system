import { NextResponse } from "next/server";

import { readId, readJson, route } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { amsDocumentSchema } from "@/lib/validations/ams-document";
import { deleteAmsDocument, getAmsDocument, updateAmsDocument } from "@/services/ams-document.service";

export const GET = route(async (_req, ctx) => {
  await requireUser("ams_document:read");
  return NextResponse.json({ data: await getAmsDocument(await readId(ctx)) });
});

export const PATCH = route(async (req, ctx) => {
  await requireUser("ams_document:update");
  const id = await readId(ctx);
  const input = await readJson(req, amsDocumentSchema);
  return NextResponse.json({ data: await updateAmsDocument(id, input) });
});

export const DELETE = route(async (_req, ctx) => {
  await requireUser("ams_document:delete");
  await deleteAmsDocument(await readId(ctx));
  return NextResponse.json({ ok: true });
});
