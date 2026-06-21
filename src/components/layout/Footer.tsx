import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { APP_NAME, RT_INFO } from "@/lib/constants";

const wargaLinks = [
  { href: "/layanan", label: "Layanan Surat" },
  { href: "/pembayaran", label: "Bayar Iuran" },
  { href: "/daftar", label: "Daftar Warga" },
  { href: "/forum", label: "Forum" },
  { href: "/status", label: "Cek Status" },
  { href: "/bantuan", label: "Bantuan" },
];

export function Footer() {
  return (
    <footer
      id="kontak"
      className="border-t border-[var(--color-border)] bg-[var(--color-text)] text-[var(--color-surface-muted)]"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-surface)]">{APP_NAME}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-subtle)]">
            Layanan digital {RT_INFO.nama}, {RT_INFO.kampung} — surat, iuran, forum, dan
            pengumuman warga.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-[var(--color-surface)]">Kontak RT</h4>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
                strokeWidth={1.75}
              />
              <span>
                {RT_INFO.alamat}, {RT_INFO.kelurahan}, {RT_INFO.kecamatan},{" "}
                {RT_INFO.kabupaten}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[var(--color-accent)]" strokeWidth={1.75} />
              <span>{RT_INFO.telepon}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[var(--color-accent)]" strokeWidth={1.75} />
              <span>{RT_INFO.email}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[var(--color-surface)]">Layanan Warga</h4>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {wargaLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="cursor-pointer text-[var(--color-text-subtle)] transition-colors duration-200 hover:text-[var(--color-surface)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--color-text-subtle)]">
            Pengurus RT:{" "}
            <Link href="/login" className="underline hover:text-[var(--color-surface)]">
              masuk di sini
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-[var(--color-text-subtle)]">
        © {new Date().getFullYear()} {RT_INFO.nama} — {APP_NAME}
      </div>
    </footer>
  );
}
