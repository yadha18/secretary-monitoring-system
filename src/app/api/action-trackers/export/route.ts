import { z } from "zod";

import { readQuery, route } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { actionTrackerListSchema } from "@/lib/validations/action-tracker";
import { buildExportResponse } from "@/services/export.service";
import { actionTrackerColumns } from "@/services/export-columns";
import { exportActionTrackers } from "@/services/action-tracker.service";

const schema = actionTrackerListSchema.extend({ format: z.enum(["csv", "xlsx"]).default("xlsx") });

export const GET = route(async (req) => {
  const user = await requireUser("action_tracker:export");
  await enforceRateLimit(`export:${user.id}`, 20, 60);
  const { format, ...query } = readQuery(req, schema);
  const rows = await exportActionTrackers(query as z.infer<typeof actionTrackerListSchema>);
  return buildExportResponse(format, "action-trackers", actionTrackerColumns, rows);
});
