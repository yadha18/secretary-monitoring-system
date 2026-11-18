import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";

import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

/**
 * Akun Administrator dibaca dari environment variables (tanpa database):
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD_HASH_B64 (hash bcrypt yang di-encode base64;
 *   buat dengan `npm run hash-password -- "passwordAnda"`).
 */
function getAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim();
  if (!email || !b64) return null;
  return {
    id: "env-admin",
    name: process.env.ADMIN_NAME?.trim() || "Administrator",
    email,
    role: "admin" as const,
    passwordHash: Buffer.from(b64, "base64").toString("utf8"),
  };
}

// Hash tiruan agar waktu respons sama baik email cocok maupun tidak.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

// Pembatas percobaan login di memori (best-effort per instance serverless).
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  if (attempts.size > 1000) {
    for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const h = await headers();
        const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
        if (tooManyAttempts(`${ip}:${email}`)) throw new RateLimitedError();

        const admin = getAdmin();
        const emailMatches = !!admin && admin.email === email;
        const ok = await bcrypt.compare(password, emailMatches ? admin.passwordHash : DUMMY_HASH);
        if (!admin || !emailMatches || !ok) return null;

        attempts.delete(`${ip}:${email}`);
        return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
      },
    }),
  ],
});
