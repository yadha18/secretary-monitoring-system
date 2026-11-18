import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { can, type Action } from "@/lib/permissions";

/** Untuk API route: pastikan login (dan, opsional, punya izin). */
export async function requireUser(action?: Action) {
  const session = await auth();
  if (!session?.user) throw new AppError("UNAUTHORIZED", "Sesi berakhir. Silakan login kembali.");
  if (action && !can(session.user.role, action)) {
    throw new AppError("FORBIDDEN", "Anda tidak memiliki izin untuk tindakan ini.");
  }
  return session.user;
}
