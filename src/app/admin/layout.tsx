import { auth } from "@/auth";
import Link from "next/link";
import {
  Activity,
  Archive,
  BarChart3,
  Calendar,
  Download,
  FileInput,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Menu,
  Receipt,
  Send,
  Shield,
  UserCog,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import { APP_NAME, RT_INFO } from "@/lib/constants";
import { filterAdminNavGroups } from "@/lib/permissions";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  inbox: FileInput,
  send: Send,
  "file-text": FileText,
  archive: Archive,
  users: Users,
  megaphone: Megaphone,
  vote: Vote,
  receipt: Receipt,
  wallet: Wallet,
  activity: Activity,
  "bar-chart": BarChart3,
  "life-buoy": LifeBuoy,
  calendar: Calendar,
  download: Download,
  shield: Shield,
  "user-cog": UserCog,
} as const;

const roleLabels: Record<string, string> = {
  admin: "Admin RT",
  "ketua-rt": "Ketua RT",
  "sekretaris-rt": "Sekretaris RT",
  "bendahara-rt": "Bendahara RT",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userLabel = session?.user?.name ?? "Pengurus RT";
  const role = session?.user?.role ?? "admin";
  const roleLabel = roleLabels[role] ?? "Pengurus RT";
  const navGroups = filterAdminNavGroups(role);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
        <div className="border-b border-[var(--color-border)] px-5 py-5">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
              <FileText className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-bold tracking-tight">{APP_NAME}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{RT_INFO.nama}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu admin">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <details className="relative lg:hidden">
              <summary className="flex cursor-pointer list-none items-center rounded-lg p-2 hover:bg-[var(--color-surface-muted)] [&::-webkit-details-marker]:hidden">
                <Menu className="h-5 w-5" />
              </summary>
              <div className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-56 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-2">
                    <p className="px-3 py-1 text-xs font-semibold text-[var(--color-text-subtle)]">{group.label}</p>
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </details>
            <p className="text-sm text-[var(--color-text-muted)]">Panel Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <AdminNotificationBell />
            <div className="text-right">
              <p className="text-sm font-medium">{userLabel}</p>
              <p className="text-xs text-[var(--color-text-subtle)]">{roleLabel}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
