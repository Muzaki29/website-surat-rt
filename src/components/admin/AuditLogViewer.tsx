"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface LogRow {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string | null;
  detail: string;
  createdAt: string;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    fetch("/api/audit-log").then((r) => r.json()).then(setLogs);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audit Log" description="Riwayat perubahan data sensitif platform." />
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
            <tr>
              <th className="px-3 py-2">Waktu</th>
              <th className="px-3 py-2">Pengguna</th>
              <th className="px-3 py-2">Aksi</th>
              <th className="px-3 py-2">Resource</th>
              <th className="px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-2 text-xs">{new Date(l.createdAt).toLocaleString("id-ID")}</td>
                <td className="px-3 py-2">{l.userName} <span className="text-xs text-[var(--color-text-subtle)]">({l.userRole})</span></td>
                <td className="px-3 py-2">{l.action}</td>
                <td className="px-3 py-2">{l.resource}</td>
                <td className="px-3 py-2 text-xs text-[var(--color-text-muted)]">{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
