import { JENIS_SURAT } from "@/data/jenis-surat";
import { REKENING_RT, RT_INFO } from "@/lib/constants";

export const PANDUAN_SECTIONS = [
  { id: "daftar", label: "Daftar & Login" },
  { id: "surat", label: "Ajukan Surat" },
  { id: "jenis-surat", label: "Jenis & Syarat Surat" },
  { id: "status", label: "Arti Status" },
  { id: "iuran", label: "Bayar Iuran" },
  { id: "forum", label: "Forum & Lainnya" },
  { id: "faq", label: "FAQ" },
  { id: "kontak", label: "Kontak & Tiket" },
] as const;

export const ALUR_DAFTAR = {
  title: "Cara daftar dan masuk sebagai warga",
  intro:
    "Warga RT 005 / RW 002 Kampung Makasar bisa mendaftar sendiri lewat website. Setelah diverifikasi pengurus RT, akun aktif dan bisa dipakai untuk forum serta layanan lainnya.",
  steps: [
    {
      title: "Buka halaman Daftar",
      detail: "Klik menu Daftar di atas, atau buka halaman /daftar. Siapkan NIK 16 digit, nomor HP aktif, dan alamat domisili di RW 002.",
      link: { href: "/daftar", label: "Ke halaman Daftar" },
    },
    {
      title: "Isi formulir pendaftaran",
      detail:
        "Lengkapi nama lengkap, NIK, alamat, nomor HP, email (opsional), dan buat kata sandi. Pastikan NIK benar — dipakai untuk login dan cek tagihan iuran.",
    },
    {
      title: "Tunggu verifikasi pengurus RT",
      detail:
        "Status akun Anda akan menunggu-verifikasi. Sekretaris atau pengurus RT memeriksa data di panel admin. Proses biasanya 1–2 hari kerja. Anda belum bisa masuk forum sebelum akun aktif.",
    },
    {
      title: "Masuk dengan NIK atau email",
      detail:
        "Setelah diverifikasi, buka menu Masuk. Gunakan NIK atau email pendaftaran + kata sandi. Warga yang sudah aktif akan diarahkan ke Forum.",
      link: { href: "/login", label: "Ke halaman Masuk" },
    },
  ],
  tips: [
    "Lupa kata sandi? Hubungi Sekretaris RT — reset manual lewat pengurus.",
    "NIK sudah terdaftar? Mungkin pernah didaftarkan pengurus. Coba masuk atau hubungi RT.",
    "Belum diverifikasi? Jangan kirim ulang pendaftaran — hubungi RT dengan nama dan NIK Anda.",
  ],
} as const;

export const ALUR_SURAT = {
  title: "Cara mengajukan surat keterangan",
  intro:
    "Pengajuan surat dilakukan online. Anda tidak perlu datang ke pos kamling untuk mengisi formulir — cukup dari HP atau komputer. Surat fisik diambil setelah status selesai.",
  steps: [
    {
      title: "Pilih jenis surat",
      detail:
        "Buka menu Layanan, pilih surat yang dibutuhkan (domisili, usaha, pengantar nikah, dll.). Baca deskripsi dan estimasi waktu proses di setiap layanan.",
      link: { href: "/layanan", label: "Lihat daftar layanan" },
    },
    {
      title: "Siapkan persyaratan",
      detail:
        "Pastikan dokumen seperti KTP, KK, dan berkas pendukung sudah siap (foto/scan jika diminta). Daftar lengkap per jenis surat ada di bagian Jenis & Syarat Surat di bawah.",
    },
    {
      title: "Isi formulir pengajuan",
      detail:
        "Isi nama pemohon, NIK, alamat, keperluan surat, dan kontak yang bisa dihubungi. Periksa ulang sebelum kirim — kesalahan NIK atau alamat bisa menunda proses.",
    },
    {
      title: "Simpan ID pengajuan",
      detail:
        "Setelah kirim, sistem memberi ID unik (contoh: PJ-20250621-XXXX). Screenshot atau catat ID ini. ID dipakai untuk lacak status tanpa perlu login.",
      link: { href: "/status", label: "Cek status pengajuan" },
    },
    {
      title: "Pantau status sampai selesai",
      detail:
        "Sekretaris RT meninjau pengajuan, lalu memproses, menyetujui, dan menerbitkan surat. Saat status Selesai, ambil surat fisik sesuar petunjuk RT (pos kamling / sekretariat RT).",
    },
  ],
  tips: [
    "Ajukan di hari kerja (Senin–Jumat) agar lebih cepat diproses.",
    "Keperluan surat tulis jelas, misalnya: \"Untuk pendaftaran sekolah anak\" bukan hanya \" untuk keperluan pribadi\".",
    "Surat pengantar kependudukan (KTP/KK baru) tetap melalui Ketua RT atau Kelurahan Makasar — lihat catatan khusus di FAQ.",
  ],
} as const;

export const ALUR_IURAN = {
  title: "Cara bayar iuran RT",
  intro: `Tagihan iuran diterbitkan Bendahara RT. Warga cek tagihan dengan NIK, bayar ke rekening ${REKENING_RT.bank} a.n. ${REKENING_RT.atasNama}, lalu konfirmasi di website.`,
  steps: [
    {
      title: "Buka halaman Bayar Iuran",
      detail: "Klik menu Iuran / Bayar Iuran. Masukkan NIK 16 digit yang terdaftar di data warga RT.",
      link: { href: "/pembayaran", label: "Ke halaman Bayar Iuran" },
    },
    {
      title: "Lihat tagihan aktif",
      detail:
        "Sistem menampilkan tagihan per periode (IPL bulanan, kas RT, iuran sosial, dll.) dengan nominal dan status belum-bayar.",
    },
    {
      title: "Transfer ke rekening RT",
      detail: `Transfer ke ${REKENING_RT.bank} ${REKENING_RT.nomor} a.n. ${REKENING_RT.atasNama}. ${REKENING_RT.qrisInfo}. Cantumkan nama & periode di berita transfer.`,
    },
    {
      title: "Kirim bukti pembayaran",
      detail:
        "Pilih tagihan, isi metode bayar (transfer/QRIS/tunai), nomor referensi transfer, lalu kirim. Status berubah menjadi menunggu-konfirmasi.",
    },
    {
      title: "Tunggu konfirmasi bendahara",
      detail:
        "Bendahara RT memverifikasi bukti (target 1×24 jam kerja). Setelah dikonfirmasi, status menjadi lunas dan tercatat di kas RT.",
    },
  ],
  rekening: REKENING_RT,
  tips: [
    "Simpan bukti transfer sampai status lunas.",
    "Nomor referensi transfer wajib diisi agar bendahara bisa cocokkan dengan mutasi rekening.",
    "Bayar tunai? Serahkan langsung ke Bendahara RT — mereka akan konfirmasi manual di sistem.",
  ],
} as const;

export const ALUR_FORUM = {
  title: "Forum, polling, dan pengumuman",
  intro: "Setelah akun warga aktif, Anda bisa ikut diskusi dan kegiatan RT secara digital.",
  items: [
    {
      title: "Forum diskusi",
      detail:
        "Masuk dengan akun warga → menu Forum. Tulis artikel/informasi atau tanggapi diskusi warga lain. Setiap artikel aktif 14 hari, lalu otomatis diarsipkan ke Riwayat Arsip (tetap bisa dibaca, tanpa tanggapan baru). Forum hanya untuk warga RT yang sudah diverifikasi.",
      link: { href: "/forum", label: "Buka Forum" },
    },
    {
      title: "Polling RT",
      detail:
        "Ikut voting keputusan RT (misalnya jadwal kerja bakti, usulan kegiatan). Satu warga satu suara per polling aktif.",
      link: { href: "/polling", label: "Lihat Polling" },
    },
    {
      title: "Pengumuman resmi",
      detail:
        "Informasi resmi dari pengurus RT (jadwal, kegiatan, pemberitahuan penting) ada di halaman Pengumuman — tidak perlu login.",
      link: { href: "/pengumuman", label: "Baca Pengumuman" },
    },
  ],
} as const;

export const STATUS_PENGAJUAN = [
  {
    status: "diajukan",
    label: "Diajukan",
    arti: "Formulir sudah diterima sistem. Menunggu Sekretaris RT membuka dan meninjau.",
    aksiWarga: "Tunggu 1 hari kerja. Cek status berkala dengan ID pengajuan.",
  },
  {
    status: "diproses",
    label: "Diproses",
    arti: "Pengurus sedang memverifikasi data dan dokumen persyaratan Anda.",
    aksiWarga: "Siapkan diri jika RT menghubungi untuk klarifikasi atau dokumen tambahan.",
  },
  {
    status: "disetujui",
    label: "Disetujui",
    arti: "Pengajuan lolos verifikasi. Surat sedang disiapkan / ditandatangani.",
    aksiWarga: "Tunggu status Selesai sebelum datang mengambil surat.",
  },
  {
    status: "ditolak",
    label: "Ditolak",
    arti: "Pengajuan tidak dapat dilanjutkan (data tidak lengkap, persyaratan kurang, dll.).",
    aksiWarga: "Hubungi Sekretaris RT untuk alasan penolakan. Ajukan ulang setelah diperbaiki.",
  },
  {
    status: "selesai",
    label: "Selesai",
    arti: "Surat sudah diterbitkan dan siap diserahkan.",
    aksiWarga: "Ambil surat fisik di tempat yang ditentukan RT. Bawa KTP asli.",
  },
] as const;

export const STATUS_IURAN = [
  {
    status: "belum-bayar",
    label: "Belum Bayar",
    arti: "Tagihan sudah terbit, belum ada pembayaran.",
    aksiWarga: "Bayar sebelum deadline yang tercantum (jika ada) via halaman Bayar Iuran.",
  },
  {
    status: "menunggu-konfirmasi",
    label: "Menunggu Konfirmasi",
    arti: "Bukti bayar sudah dikirim, Bendahara RT sedang memverifikasi.",
    aksiWarga: "Tunggu maksimal 1×24 jam kerja. Jangan transfer ulang kecuali diminta.",
  },
  {
    status: "lunas",
    label: "Lunas",
    arti: "Pembayaran sudah dikonfirmasi dan tercatat.",
    aksiWarga: "Simpan bukti transfer sebagai arsip pribadi.",
  },
] as const;

export const JENIS_SURAT_PANDUAN = JENIS_SURAT.map((s) => ({
  slug: s.slug,
  nama: s.nama,
  estimasiHari: s.estimasiHari,
  deskripsi: s.deskripsi,
  persyaratan: s.persyaratan,
  href: `/layanan/${s.slug}`,
}));

export const FAQ_DETAIL = [
  {
    q: "Apakah wajib punya akun untuk ajukan surat?",
    a: "Tidak wajib login. Pengajuan surat bisa dilakukan tanpa akun — cukup isi formulir dan simpan ID pengajuan. Akun warga diperlukan untuk forum, dan memudahkan jika fitur terintegrasi penuh nanti.",
  },
  {
    q: "Berapa lama surat jadi?",
    a: "Umumnya 1–3 hari kerja tergantung jenis surat. Domisili dan pengantar nikah biasanya 1 hari; SKTM atau ahli waris bisa 2–3 hari. Estimasi tertera di setiap layanan.",
  },
  {
    q: "Bagaimana cara mengurus surat pengantar kependudukan (KTP/KK)?",
    a: `Surat pengantar ke Dinas/Kelurahan untuk KTP atau KK baru: datang ke ${RT_INFO.ketua} di ${RT_INFO.kampung}, atau langsung ke ${RT_INFO.kantorKelurahan}. Surat keterangan lain (domisili, usaha, dll.) bisa diajukan online di menu Layanan.`,
  },
  {
    q: "Pembayaran sudah transfer tapi status belum lunas?",
    a: "Normal jika masih menunggu-konfirmasi. Bendahara RT memverifikasi manual. Pastikan nomor referensi transfer sudah diisi benar. Jika lebih dari 2 hari kerja, hubungi Bendahara RT dengan bukti transfer.",
  },
  {
    q: "Bisa bayar iuran pakai e-wallet / Midtrans?",
    a: "Jika RT mengaktifkan Midtrans, opsi bayar online muncul di halaman Bayar Iuran. Jika tidak, gunakan transfer bank atau QRIS ke rekening/kas RT.",
  },
  {
    q: "Login gagal padahal sudah daftar?",
    a: "Kemungkinan akun belum diverifikasi pengurus RT. Hubungi Sekretaris RT. Periksa juga NIK/email dan kata sandi. Warga baru tidak bisa masuk forum sebelum status aktif.",
  },
  {
    q: "ID pengajuan hilang, bagaimana?",
    a: "Buka Cek Status, coba cari dengan NIK jika fitur tersedia, atau buat tiket bantuan di bawah dengan nama, NIK, dan tanggal pengajuan. Sekretaris RT bisa lacak di sistem admin.",
  },
  {
    q: "Apakah data NIK aman?",
    a: "Data disimpan di server RT dan hanya diakses pengurus berwenang (Sekretaris, Bendahara, Admin). Jangan bagikan kata sandi akun kepada orang lain.",
  },
  {
    q: "Surat ditolak, apa yang harus dilakukan?",
    a: "Hubungi Sekretaris RT untuk mengetahui alasan. Lengkapi persyaratan yang kurang, perbaiki data formulir, lalu ajukan ulang sebagai pengajuan baru.",
  },
  {
    q: "Siapa dihubungi jika website error?",
    a: `Buat tiket support di halaman ini (topik Bug / Error Sistem) atau hubungi ${RT_INFO.telepon} / ${RT_INFO.email}. Sertakan screenshot jika memungkinkan.`,
  },
] as const;
