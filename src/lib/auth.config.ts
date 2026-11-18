import type { NextAuthConfig } from "next-auth";

/**
 * Konfigurasi yang aman untuk proxy (tanpa Mongoose/bcrypt).
 * Provider Credentials ditambahkan di auth.ts (runtime Node).
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 jam
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname === "/login") {
        return isLoggedIn ? Response.redirect(new URL("/dashboard", nextUrl)) : true;
      }

      if (isLoggedIn) return true;

      if (pathname.startsWith("/api/")) {
        return Response.json(
          { error: { code: "UNAUTHORIZED", message: "Sesi berakhir. Silakan login kembali." } },
          { status: 401 }
        );
      }
      return false; // redirect ke /login
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
