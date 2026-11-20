import { NextResponse } from "next/server";

import { readQuery, route } from "@/lib/api";
import { resolveRange } from "@/lib/date-range";
import { requireUser } from "@/lib/session";
import { dashboardQuerySchema } from "@/lib/validations/dashboard";
import { getDashboard } from "@/services/dashboard.service";

export const GET = route(async (req) => {
  await requireUser("dashboard:read");
  const q = readQuery(req, dashboardQuerySchema);
  const range = resolveRange(q.range, { from: q.from, to: q.to });
  return NextResponse.json({ data: await getDashboard(range) }, { headers: { "Cache-Control": "private, no-store" } });
});