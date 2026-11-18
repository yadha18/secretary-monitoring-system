import { NextResponse } from "next/server";

import { readId, readJson, route } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { incomingDocumentSchema } from "@/lib/validations/incoming-document";
import { deleteIncomingDocument, getIncomingDocument, updateIncomingDocument } from "@/services/incoming-document.service";

export const GET = route(async (_req, ctx) => {
  await requireUser("incoming_document:read");
  return NextResponse.json({ data: await getIncomingDocument(await readId(ctx)) });
});

export const PATCH = route(async (req, ctx) => {
  await requireUser("incoming_document:update");
  const id = await readId(ctx);
  const input = await readJson(req, incomingDocumentSchema);
  return NextResponse.json({ data: await updateIncomingDocument(id, input) });
});

export const DELETE = route(async (_req, ctx) => {
  await requireUser("incoming_document:delete");
  await deleteIncomingDocument(await readId(ctx));
  return NextResponse.json({ ok: true });
});
