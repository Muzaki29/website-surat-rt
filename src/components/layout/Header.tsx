"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FileText, LogOut, Menu, User } from "lucide-react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export function Header() {
  const { data: session } = useSession();
  const isWarga = session?.user?.role === "warga";
  const isStaff = session?.user && !isWarga;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/status"
            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Cek Status
          </Link>

          {session?.user ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                <User className="h-4 w-4" />
                {session.user.name.split(" ")[0]}
              </span>
              {isStaff && (
                <Link
                  href="/admin"
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/daftar"
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
              >
                Masuk
              </Link>
            </>
          )}

          <Link
            href="/layanan"
            className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Ajukan Surat
          </Link>
        </div>

        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-lg p-2 hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] [&::-webkit-details-marker]:hidden">
            <Menu className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Buka menu</span>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg shadow-slate-900/5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-muted)]"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-[var(--color-border)]" />
            <Link href="/status" className="block rounded-lg px-3 py-2 text-sm">
              Cek Status
            </Link>
            {!session?.user && (
              <>
                <Link href="/daftar" className="block rounded-lg px-3 py-2 text-sm">
                  Daftar Warga
                </Link>
                <Link href="/login" className="block rounded-lg px-3 py-2 text-sm">
                  Masuk
                </Link>
              </>
            )}
            {session?.user && (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-muted)]"
              >
                Keluar ({session.user.name.split(" ")[0]})
              </button>
            )}
            <Link
              href="/layanan"
              className="mt-1 block rounded-lg bg-[var(--color-primary)] px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Ajukan Surat
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
