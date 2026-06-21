import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
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
      },
      async authorize(credentials) {
        const identifier = (credentials?.email as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

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
        session.user.role = (token.role as PeranPengguna) ?? "admin";
        session.user.wargaId = (token.wargaId as string | null) ?? null;
      }
      return session;
    },
  },
});
