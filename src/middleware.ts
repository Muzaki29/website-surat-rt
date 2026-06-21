import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_API = [
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/pengajuan$/,
  /^\/api\/iuran$/,
  /^\/api\/support$/,
  /^\/api\/polling$/,
  /^\/api\/payment\/midtrans$/,
  /^\/api\/payment\/midtrans\/notification$/,
];

function isPublicApi(pathname: string, method: string): boolean {
  if (pathname === "/api/auth/register" && method === "POST") return true;
  if (pathname.startsWith("/api/surat-keluar/") && pathname.endsWith("/pdf") && method === "GET") {
    return false;
  }
  if (pathname === "/api/pengumuman" && method === "GET") return true;
  if (pathname === "/api/polling" && (method === "GET" || method === "POST")) return true;
  return PUBLIC_API.some((pattern) => pattern.test(pathname));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (pathname.startsWith("/admin") && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/forum") && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/api") && !isPublicApi(pathname, method) && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && req.auth?.user.role === "warga") {
    return NextResponse.redirect(new URL("/forum", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/forum/:path*"],
};
