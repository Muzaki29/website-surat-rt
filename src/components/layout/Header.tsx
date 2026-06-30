"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { WargaNotificationBell } from "@/components/warga/WargaNotificationBell";
import {
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  APP_NAME,
  HEADER_MORE_NAV,
  HEADER_PRIMARY_NAV,
  NAV_LINKS,
} from "@/lib/constants";
import { cn } from "@/lib/cn";

function navIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  pathname,
  className,
}: {
  href: string;
  label: string;
  pathname: string;
  className?: string;
}) {
  const active = navIsActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--color-surface-muted)] text-[var(--color-primary)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)]",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isWarga = session?.user?.role === "warga";
  const isStaff = session?.user && !isWarga;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const moreHasActive = HEADER_MORE_NAV.some((link) => navIsActive(pathname, link.href));

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-surface)]/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white sm:h-9 sm:w-9">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </span>
          <span className="text-base font-bold tracking-tight sm:text-lg">{APP_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label="Navigasi utama"
        >
          {HEADER_PRIMARY_NAV.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
          ))}

          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-0.5 whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
                moreHasActive || moreOpen
                  ? "bg-[var(--color-surface-muted)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)]",
              )}
            >
              Lainnya
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform duration-200", moreOpen && "rotate-180")}
                strokeWidth={2}
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                className="absolute left-1/2 top-[calc(100%+0.35rem)] z-50 min-w-[11rem] -translate-x-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-lg shadow-slate-900/8"
              >
                {HEADER_MORE_NAV.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className={cn(
                      "block cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                      navIsActive(pathname, link.href)
                        ? "bg-[var(--color-surface-muted)] text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)]",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <div
            className="mr-1 h-5 w-px bg-[var(--color-border)]"
            aria-hidden="true"
          />

          {session?.user ? (
            <>
              {isWarga ? (
                <>
                  <WargaNotificationBell />
                  <NavLink href="/akun" label="Akun Saya" pathname={pathname} />
                </>
              ) : null}
              <Link
                href={isWarga ? "/akun" : "/admin"}
                className="inline-flex max-w-[7rem] cursor-pointer items-center gap-1.5 truncate rounded-md bg-[var(--color-surface-muted)] px-2.5 py-2 text-[13px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
              >
                <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{session.user.name.split(" ")[0]}</span>
              </Link>
              {isStaff && (
                <NavLink href="/admin" label="Admin" pathname={pathname} />
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)]"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                Keluar
              </button>
            </>
          ) : (
            <>
              <NavLink href="/daftar" label="Daftar" pathname={pathname} />
              <NavLink href="/login" label="Masuk" pathname={pathname} />
            </>
          )}

          <Link
            href="/layanan"
            className="ml-1 inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Ajukan Surat
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          {session?.user && isWarga ? <WargaNotificationBell /> : null}
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
          {mobileOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
          <span className="sr-only">{mobileOpen ? "Tutup menu" : "Buka menu"}</span>
        </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-lg sm:top-16 lg:hidden"
            aria-label="Navigasi mobile"
          >
            <div className="mx-auto max-w-7xl space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={navIsActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    navIsActive(pathname, link.href)
                      ? "bg-[var(--color-surface-muted)] text-[var(--color-primary)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/status"
                aria-current={navIsActive(pathname, "/status") ? "page" : undefined}
                className={cn(
                  "block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  navIsActive(pathname, "/status")
                    ? "bg-[var(--color-surface-muted)] text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
                )}
              >
                Cek Status
              </Link>

              <hr className="my-2 border-[var(--color-border)]" />

              {session?.user ? (
                <>
                  {isWarga && (
                    <Link
                      href="/akun"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-surface-muted)]"
                    >
                      Akun Saya
                    </Link>
                  )}
                  <p className="px-3 py-1 text-xs text-[var(--color-text-subtle)]">
                    Masuk sebagai {session.user.name}
                  </p>
                  {isStaff && (
                    <Link
                      href="/admin"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--color-surface-muted)]"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/daftar"
                    className="rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-center text-sm font-medium"
                  >
                    Daftar
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-center text-sm font-medium"
                  >
                    Masuk
                  </Link>
                </div>
              )}

              <Link
                href="/layanan"
                className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Ajukan Surat
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
