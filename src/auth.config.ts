import type { NextAuthConfig } from "next-auth";
import type { PeranPengguna } from "@/lib/types";

declare module "next-auth" {
  interface User {
    role?: PeranPengguna;
    wargaId?: string | null;
    tokenVersion?: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: PeranPengguna;
      wargaId?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: PeranPengguna;
    id?: string;
    wargaId?: string | null;
    tokenVersion?: number;
    revoked?: boolean;
  }
}

/** Konfigurasi ringan untuk middleware (Edge) — tanpa Prisma/bcrypt/captcha. */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.wargaId = user.wargaId;
        token.tokenVersion = user.tokenVersion ?? 0;
        token.revoked = false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.revoked || !token.id) {
        return { ...session, expires: new Date(0).toISOString() };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as PeranPengguna) ?? "warga";
        session.user.wargaId = (token.wargaId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
