export const APP_NAME = "SuratRT";
export const APP_TAGLINE = "Platform Digital Manajemen RT Kampung Makasar";

export const RT_INFO = {
  nama: "RT 005 / RW 002",
  rt: "RT 005",
  rw: "RW 002",
  kampung: "Kampung Makasar",
  kelurahan: "Kelurahan Makasar",
  kecamatan: "Kecamatan Makasar",
  kabupaten: "Kota Jakarta Timur",
  provinsi: "DKI Jakarta",
  alamat: "Kampung Makasar, RW 002",
  telepon: "08xxxxxxxxxx",
  email: "rt005rw002.makasar@gmail.com",
  ketua: "Ketua RT 005 Kampung Makasar",
  sekretaris: "Sekretaris RT 005",
  bendahara: "Bendahara RT 005",
  kantorKelurahan: "Kantor Kelurahan Makasar",
  puskesmas: "Puskesmas Kecamatan Makasar",
  deskripsiWilayah:
    "Wilayah RT 005 RW 002, Kampung Makasar, Kecamatan Makasar, Kota Jakarta Timur — berada di bawah administrasi Kelurahan Makasar.",
} as const;

export const FASILITAS_SEKITAR = [
  {
    kategori: "Kesehatan",
    nama: "Puskesmas Kecamatan Makasar",
    keterangan: "Layanan kesehatan terdekat untuk warga RW 002.",
  },
  {
    kategori: "Pendidikan",
    nama: "PAUD sekitar RW 002",
    keterangan: "Beberapa sekolah anak usia dini (referensi Kemendikbud).",
  },
  {
    kategori: "Ibadah",
    nama: "Masjid Jami Nurul Huda",
    keterangan: "Sarana peribadatan warga Kampung Makasar.",
  },
  {
    kategori: "Ibadah",
    nama: "Masjid Jami Al Ihsan",
    keterangan: "Masjid warga Kelurahan Makasar.",
  },
] as const;

export const INFO_LAYANAN_KEPENDUDUKAN =
  "Untuk mengurus surat pengantar kependudukan, datang ke Ketua RT/RW setempat atau ke Kantor Kelurahan Makasar (Profil Camat Makasar).";

export const FORUM_RETENTION_DAYS = 14;

export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Layanan Surat" },
  { href: "/pembayaran", label: "Bayar Iuran" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/polling", label: "Polling" },
  { href: "/forum", label: "Forum" },
  { href: "/bantuan", label: "Bantuan" },
] as const;

/** Label ringkas untuk navbar desktop — hindari wrap teks */
export const HEADER_PRIMARY_NAV = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Layanan" },
  { href: "/pembayaran", label: "Iuran" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/forum", label: "Forum" },
] as const;

export const HEADER_MORE_NAV = [
  { href: "/polling", label: "Polling" },
  { href: "/status", label: "Cek Status" },
  { href: "/bantuan", label: "Bantuan" },
] as const;

export const REKENING_RT = {
  bank: "BCA",
  nomor: "1234567890",
  atasNama: "Kas RT 005 / RW 002 Kampung Makasar",
  qrisInfo: "Scan QRIS di pos kamling RW 002 atau hubungi Bendahara RT",
} as const;

export const JENIS_IURAN = [
  { id: "ipl", nama: "IPL Bulanan", nominal: 50000 },
  { id: "kas-rt", nama: "Kas RT", nominal: 10000 },
  { id: "sosial", nama: "Iuran Sosial", nominal: 20000 },
] as const;

export const ADMIN_NAV_GROUPS = [
  {
    label: "Ringkasan",
    items: [{ href: "/admin", label: "Dashboard", icon: "layout-dashboard" }],
  },
  {
    label: "Penyuratan",
    items: [
      { href: "/admin/surat-masuk", label: "Surat Masuk", icon: "inbox" },
      { href: "/admin/surat-keluar", label: "Surat Keluar", icon: "send" },
      { href: "/admin/pengajuan", label: "Pengajuan Warga", icon: "file-text" },
      { href: "/admin/arsip", label: "Arsip", icon: "archive" },
    ],
  },
  {
    label: "Warga & Lingkungan",
    items: [
      { href: "/admin/warga", label: "Data Warga", icon: "users" },
      { href: "/admin/pengumuman", label: "Pengumuman", icon: "megaphone" },
      { href: "/admin/polling", label: "Polling", icon: "vote" },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { href: "/admin/iuran", label: "Iuran & Tagihan", icon: "receipt" },
      { href: "/admin/kas", label: "Kas RT", icon: "wallet" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/monitoring", label: "Monitoring", icon: "activity" },
      { href: "/admin/analitik", label: "Analitik", icon: "bar-chart" },
      { href: "/admin/support", label: "Support & Tiket", icon: "life-buoy" },
    ],
  },
] as const;

export type AdminNavItem = (typeof ADMIN_NAV_GROUPS)[number]["items"][number];

/** Flat list for mobile menu */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => [...g.items]);
