import { NextResponse } from "next/server";

import { readJson, readQuery, route } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { incomingDocumentSchema, incomingDocumentListSchema } from "@/lib/validations/incoming-document";
import { createIncomingDocument, listIncomingDocuments } from "@/services/incoming-document.service";

export const GET = route(async (req) => {
  await requireUser("incoming_document:read");
  const result = await listIncomingDocuments(readQuery(req, incomingDocumentListSchema));
  return NextResponse.json(result);
});

export const POST = route(async (req) => {
  await requireUser("incoming_document:create");
  const input = await readJson(req, incomingDocumentSchema);
  const data = await createIncomingDocument(input);
  return NextResponse.json({ data }, { status: 201 });
});
