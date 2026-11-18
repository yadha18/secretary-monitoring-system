import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

// Gerbang login: hanya memeriksa JWT (tanpa akses database).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Lewati route Auth.js, aset Next.js, dan file statis.
  
  matcher: ["/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
