import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { searchArsip } from "@/lib/arsip";

export async function GET(request: Request) {
  const auth = await requirePermission("arsip:read");
  if (auth.error) return auth.error;
  const params = new URL(request.url).searchParams;
  const items = await searchArsip({
    q: params.get("q") ?? undefined,
    jenis: (params.get("jenis") as "all" | "surat-masuk" | "surat-keluar" | "pengajuan") ?? "all",
    dari: params.get("dari") ?? undefined,
    sampai: params.get("sampai") ?? undefined,
  });

  return NextResponse.json(items);
}
