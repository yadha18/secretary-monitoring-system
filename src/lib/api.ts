import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

import { AppError, handleApiError } from "@/lib/errors";
import { searchParamsToObject } from "@/lib/validations/common";
import { idParam } from "@/lib/validations/common";

type Ctx = { params: Promise<Record<string, string>> };

/** Bungkus route handler dengan penanganan error terpusat. */
export function route(handler: (req: NextRequest, ctx: Ctx) => Promise<Response>) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

export async function readJson<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("VALIDATION_ERROR", "Body harus berupa JSON yang valid.");
  }
  return schema.parse(body);
}

export function readQuery<T>(req: NextRequest, schema: ZodType<T>): T {
  return schema.parse(searchParamsToObject(req.nextUrl.searchParams));
}

export async function readId(ctx: Ctx): Promise<string> {
  const { id } = await ctx.params;
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new AppError("NOT_FOUND", "Data tidak ditemukan.");
  return parsed.data;
}
