import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

import { AppError, handleApiError } from "@/lib/errors";
import { searchParamsToObject } from "@/lib/validations/common";
import { idParam } from "@/lib/validations/common";

type Ctx = { params: Promise<Record<string, string>> };

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertSameOrigin(req: Request): void {
  if (SAFE_METHODS.has(req.method)) return;
  if (req.headers.get("sec-fetch-site") === "cross-site") {
    throw new AppError("FORBIDDEN", "Permintaan lintas situs ditolak.");
  }
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError("FORBIDDEN", "Origin tidak valid.");
  }
  if (!host || originHost !== host) throw new AppError("FORBIDDEN", "Permintaan lintas situs ditolak.");
}

/** Bungkus route handler dengan penanganan error terpusat. */
export function route(handler: (req: NextRequest, ctx: Ctx) => Promise<Response>) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      assertSameOrigin(req);
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
