import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyMathCaptcha } from "@/lib/captcha";
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
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
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

        if (!captchaToken || !captchaAnswer || !verifyMathCaptcha(captchaToken, captchaAnswer)) {
          throw new Error("Captcha tidak valid atau sudah kedaluwarsa.");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { nik: identifier }],
          },
        });
        if (!user) return null;

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
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.wargaId = user.wargaId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as PeranPengguna) ?? "warga";
        session.user.wargaId = (token.wargaId as string | null) ?? null;
      }
      return session;
    },
  },
});
