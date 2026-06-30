import { auth } from "@/auth";
import { canAccessAdminPath } from "@/lib/permissions";
import { NextResponse } from "next/server";

const PUBLIC_API = [
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/pengajuan$/,
  /^\/api\/support$/,
  /^\/api\/polling$/,
  /^\/api\/payment\/midtrans\/notification$/,
];

function isPublicApi(pathname: string, method: string, searchParams: URLSearchParams): boolean {
  if (pathname === "/api/auth/register" && method === "POST") return true;
  if (pathname === "/api/captcha" && method === "GET") return true;
  if (pathname === "/api/pengajuan/extract" && method === "POST") return true;
  if (pathname.startsWith("/api/surat-keluar/") && pathname.endsWith("/pdf") && method === "GET") {
    return false;
  }
  if (pathname === "/api/pengumuman" && method === "GET") return true;
  if (pathname === "/api/polling" && method === "GET") return true;
  if (pathname === "/api/pengajuan" && method === "GET") {
    return searchParams.has("id");
  }
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

  if (pathname.startsWith("/akun") && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/akun") && req.auth?.user.role !== "warga") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (pathname.startsWith("/api") && !isPublicApi(pathname, method, req.nextUrl.searchParams) && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && req.auth?.user.role === "warga") {
    return NextResponse.redirect(new URL("/akun", req.nextUrl.origin));
  }

  if (
    pathname.startsWith("/admin") &&
    req.auth &&
    req.auth.user.role !== "warga" &&
    !canAccessAdminPath(req.auth.user.role, pathname)
  ) {
    const denied = new URL("/admin", req.nextUrl.origin);
    denied.searchParams.set("akses", "ditolak");
    return NextResponse.redirect(denied);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/forum/:path*", "/akun/:path*"],
};
