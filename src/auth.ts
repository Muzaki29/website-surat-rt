import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyMathCaptcha } from "@/lib/captcha";
import { checkRateLimit } from "@/lib/rate-limit";
import type { PeranPengguna } from "@/lib/types";

declare module "next-auth" {
  interface User {
    role?: PeranPengguna;
    wargaId?: string | null;
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

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email atau NIK", type: "text" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Captcha Token", type: "text" },
        captchaAnswer: { label: "Captcha Answer", type: "text" },
      },
      async authorize(credentials) {
        const identifier = (credentials?.email as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        const captchaToken = credentials?.captchaToken as string | undefined;
        const captchaAnswer = credentials?.captchaAnswer as string | undefined;

        if (!identifier || !password) return null;

        const rl = await checkRateLimit(`login:${identifier}`);
        if (!rl.allowed) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.");
        }

        if (!captchaToken || !captchaAnswer || !verifyMathCaptcha(captchaToken, captchaAnswer)) {
          throw new Error("Captcha tidak valid atau sudah kedaluwarsa.");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { nik: identifier }],
          },
        });
        if (!user) return null;

        if (user.active === false) {
          throw new Error("Akun dinonaktifkan. Hubungi pengurus RT.");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        if (user.role === "warga" && user.wargaId) {
          const warga = await prisma.warga.findUnique({ where: { id: user.wargaId } });
          if (!warga || warga.status !== "aktif") {
            throw new Error("Akun warga belum diverifikasi pengurus RT.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as PeranPengguna,
          wargaId: user.wargaId,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.wargaId = user.wargaId;
        token.tokenVersion = (user as { tokenVersion?: number }).tokenVersion ?? 0;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { active: true, tokenVersion: true, role: true },
        });
        if (
          !dbUser ||
          dbUser.active === false ||
          dbUser.tokenVersion !== (token.tokenVersion ?? 0)
        ) {
          return { ...token, revoked: true };
        }
        token.role = dbUser.role as PeranPengguna;
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
});
