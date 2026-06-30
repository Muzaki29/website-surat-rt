import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { exportIuranCsv, exportKasCsv, exportTunggakanCsv } from "@/lib/export-keuangan";

export async function GET(request: Request) {
  const auth = await requirePermission("laporan:read");
  if (auth.error) return auth.error;

  const type = new URL(request.url).searchParams.get("type") ?? "iuran";

  let csv: string;
  let filename: string;

  switch (type) {
    case "kas":
      csv = await exportKasCsv();
      filename = "laporan-kas-rt.csv";
      break;
    case "tunggakan":
      csv = await exportTunggakanCsv();
      filename = "tunggakan-iuran-rt.csv";
      break;
    default:
      csv = await exportIuranCsv();
      filename = "laporan-iuran-rt.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
