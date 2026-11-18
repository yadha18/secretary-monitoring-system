import { z } from "zod";

import { readQuery, route } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { amsDocumentListSchema } from "@/lib/validations/ams-document";
import { buildExportResponse } from "@/services/export.service";
import { amsDocumentColumns } from "@/services/export-columns";
import { exportAmsDocuments } from "@/services/ams-document.service";

const schema = amsDocumentListSchema.extend({ format: z.enum(["csv", "xlsx"]).default("xlsx") });

export const GET = route(async (req) => {
  const user = await requireUser("ams_document:export");
  await enforceRateLimit(`export:${user.id}`, 20, 60);
  const { format, ...query } = readQuery(req, schema);
  const rows = await exportAmsDocuments(query as z.infer<typeof amsDocumentListSchema>);
  return buildExportResponse(format, "ams-documents", amsDocumentColumns, rows);
});
