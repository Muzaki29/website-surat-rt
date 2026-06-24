import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-api";
import { bulkDeleteRecords, isBulkResource, parseBulkIds } from "@/lib/bulk-delete";

export async function POST(request: Request) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const body = await request.json();
  const resource = typeof body.resource === "string" ? body.resource : "";
  const ids = parseBulkIds(body.ids);

  if (!isBulkResource(resource)) {
    return NextResponse.json({ error: "Resource tidak valid" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ error: "Pilih minimal satu data untuk dihapus" }, { status: 400 });
  }

  const { deleted } = await bulkDeleteRecords(resource, ids);

  if (deleted === 0) {
    return NextResponse.json({ error: "Tidak ada data yang terhapus" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted });
}
