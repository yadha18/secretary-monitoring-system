import { z } from "zod";

import { readQuery, route } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { incomingDocumentListSchema } from "@/lib/validations/incoming-document";
import { buildExportResponse } from "@/services/export.service";
import { incomingDocumentColumns } from "@/services/export-columns";
import { exportIncomingDocuments } from "@/services/incoming-document.service";

const schema = incomingDocumentListSchema.extend({ format: z.enum(["csv", "xlsx"]).default("xlsx") });

export const GET = route(async (req) => {
  const user = await requireUser("incoming_document:export");
  await enforceRateLimit(`export:${user.id}`, 20, 60);
  const { format, ...query } = readQuery(req, schema);
  const rows = await exportIncomingDocuments(query as z.infer<typeof incomingDocumentListSchema>);
  return buildExportResponse(format, "incoming-documents", incomingDocumentColumns, rows);
});
