import { connectDB } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { RateLimit } from "@/models/RateLimit";

/**
 * Rate limiter berbasis MongoDB (TTL index membersihkan dokumen kedaluwarsa).
 * Aman untuk serverless karena state tidak disimpan di memori.
 * Mengembalikan true bila permintaan masih diizinkan.
 */
export async function hit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  await connectDB();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  for (let attempt = 0; attempt < 2; attempt++) {
    // Jendela masih aktif → tambah hitungan secara atomik.
    const active = await RateLimit.findOneAndUpdate(
      { key, expiresAt: { $gt: now } },
      { $inc: { count: 1 } },
      { new: true }
    );
    if (active) return active.count <= limit;

    // Tidak ada jendela aktif → mulai jendela baru.
    try {
      await RateLimit.findOneAndUpdate(
        { key },
        { $set: { count: 1, expiresAt } },
        { upsert: true, new: true }
      );
      return true;
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err; // balapan upsert → coba lagi
    }
  }
  return true;
}

export async function reset(key: string): Promise<void> {
  await connectDB();
  await RateLimit.deleteOne({ key });
}

/** Untuk API route: lempar 429 bila melebihi batas. */
export async function enforceRateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  if (!(await hit(key, limit, windowSeconds))) {
    throw new AppError("RATE_LIMITED", "Terlalu banyak permintaan. Coba lagi beberapa saat.");
  }
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
