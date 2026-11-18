import { NextResponse } from "next/server";

import { readJson, readQuery, route } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { amsDocumentSchema, amsDocumentListSchema } from "@/lib/validations/ams-document";
import { createAmsDocument, listAmsDocuments } from "@/services/ams-document.service";

export const GET = route(async (req) => {
  await requireUser("ams_document:read");
  const result = await listAmsDocuments(readQuery(req, amsDocumentListSchema));
  return NextResponse.json(result);
});

export const POST = route(async (req) => {
  await requireUser("ams_document:create");
  const input = await readJson(req, amsDocumentSchema);
  const data = await createAmsDocument(input);
  return NextResponse.json({ data }, { status: 201 });
});
