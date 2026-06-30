"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import type { Notifikasi } from "@/lib/types";

const levelDot: Record<string, string> = {
  info: "bg-sky-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  critical: "bg-red-500",
};

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notifikasi[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifikasi");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items ?? []);
    setUnread(data.unread ?? 0);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifikasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    });
    load();
  }

  async function markRead(id: string) {
    await fetch("/api/notifikasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <p className="font-semibold text-sm">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex cursor-pointer items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                Belum ada notifikasi.
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href ?? "#"}
                    onClick={() => {
                      if (!n.dibaca) markRead(n.id);
                      setOpen(false);
                    }}
                    className={`block cursor-pointer px-4 py-3 transition-colors hover:bg-[var(--color-surface-muted)] ${
                      !n.dibaca ? "bg-sky-50/40" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${levelDot[n.level] ?? "bg-slate-400"}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.judul}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
                          {n.pesan}
                        </p>
                        <p className="mt-1 text-[10px] text-[var(--color-text-subtle)]">
                          {new Date(n.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
