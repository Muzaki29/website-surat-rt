import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { listAuditLogs } from "@/lib/audit-log";

export async function GET() {
  const auth = await requirePermission("audit:read");
  if (auth.error) return auth.error;

  const logs = await listAuditLogs(200);
  return NextResponse.json(logs);
}
