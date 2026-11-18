import { NextResponse } from "next/server";

import { readJson, readQuery, route } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { actionTrackerSchema, actionTrackerListSchema } from "@/lib/validations/action-tracker";
import { createActionTracker, listActionTrackers } from "@/services/action-tracker.service";

export const GET = route(async (req) => {
  await requireUser("action_tracker:read");
  const result = await listActionTrackers(readQuery(req, actionTrackerListSchema));
  return NextResponse.json(result);
});

export const POST = route(async (req) => {
  await requireUser("action_tracker:create");
  const input = await readJson(req, actionTrackerSchema);
  const data = await createActionTracker(input);
  return NextResponse.json({ data }, { status: 201 });
});
