import { NextResponse } from "next/server";
import { searchArsip } from "@/lib/arsip";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const items = await searchArsip({
    q: params.get("q") ?? undefined,
    jenis: (params.get("jenis") as "all" | "surat-masuk" | "surat-keluar" | "pengajuan") ?? "all",
    dari: params.get("dari") ?? undefined,
    sampai: params.get("sampai") ?? undefined,
  });

  return NextResponse.json(items);
}
