import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Cron harian: hapus upload sementara (tmp/) yang tidak pernah didaftarkan ke dokumen.
 * Dilindungi CRON_SECRET (Vercel Cron mengirim header Authorization: Bearer <CRON_SECRET>).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Tidak diizinkan." } },
      { status: 401 },
    );
  }

  const cutoff = Date.now() - MAX_AGE_MS;
  const stale: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "tmp/", cursor, limit: 500 });
    for (const b of page.blobs)
      if (new Date(b.uploadedAt).getTime() < cutoff) stale.push(b.pathname);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  for (let i = 0; i < stale.length; i += 100)
    await del(stale.slice(i, i + 100));
  return NextResponse.json({ deleted: stale.length });
}
