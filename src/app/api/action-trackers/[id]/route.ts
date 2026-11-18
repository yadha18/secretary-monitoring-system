import { NextResponse } from "next/server";

import { readId, readJson, route } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { actionTrackerSchema } from "@/lib/validations/action-tracker";
import { deleteActionTracker, getActionTracker, updateActionTracker } from "@/services/action-tracker.service";

export const GET = route(async (_req, ctx) => {
  await requireUser("action_tracker:read");
  return NextResponse.json({ data: await getActionTracker(await readId(ctx)) });
});

export const PATCH = route(async (req, ctx) => {
  await requireUser("action_tracker:update");
  const id = await readId(ctx);
  const input = await readJson(req, actionTrackerSchema);
  return NextResponse.json({ data: await updateActionTracker(id, input) });
});

export const DELETE = route(async (_req, ctx) => {
  await requireUser("action_tracker:delete");
  await deleteActionTracker(await readId(ctx));
  return NextResponse.json({ ok: true });
});
