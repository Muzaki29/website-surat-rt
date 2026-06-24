import type { BulkResource } from "@/lib/bulk-delete";

export async function bulkDeleteRequest(
  resource: BulkResource,
  ids: string[],
): Promise<{ deleted: number }> {
  const res = await fetch("/api/bulk/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource, ids }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error ?? "Gagal menghapus data");
  }

  return { deleted: data.deleted ?? ids.length };
}
