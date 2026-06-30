import { APP_NAME, RT_INFO } from "@/lib/constants";

export const TERMS_WARGA = {
  title: "Syarat & Ketentuan Pendaftaran Warga",
  updatedAt: "Juni 2026",
  sections: [
    {
      heading: "1. Ketentuan Umum",
      body: `Dengan mendaftar di ${APP_NAME}, Anda menyatakan bahwa data yang diisi adalah benar, data diri Anda sendiri, dan Anda adalah warga atau calon warga yang sah di wilayah ${RT_INFO.nama}, ${RT_INFO.kampung}.`,
    },
    {
      heading: "2. Verifikasi Akun",
      body: "Akun baru berstatus menunggu verifikasi pengurus RT. Anda baru dapat mengakses forum dan fitur warga setelah diverifikasi. Pengurus berhak menolak pendaftaran jika data tidak valid.",
    },
    {
      heading: "3. Penggunaan Data",
      body: "Data NIK, alamat, dan kontak digunakan untuk keperluan administrasi RT (surat, iuran, pengumuman, dan komunikasi resmi). Data tidak dibagikan ke pihak luar tanpa persetujuan, kecuali diwajibkan hukum.",
    },
    {
      heading: "4. Keamanan Akun",
      body: "Anda bertanggung jawab menjaga kerahasiaan kata sandi. Segera hubungi pengurus RT jika menduga akun disalahgunakan.",
    },
    {
      heading: "5. Forum & Komunitas",
      body: "Diskusi di forum wajib sopan, tidak mengandung SARA, hoaks, atau ancaman. Konten forum memiliki masa aktif terbatas lalu diarsipkan. Pengurus dapat menonaktifkan akun yang melanggar.",
    },
    {
      heading: "6. Perubahan Ketentuan",
      body: "Pengurus RT dapat memperbarui syarat ini sewaktu-waktu. Penggunaan layanan setelah pembaruan dianggap sebagai persetujuan atas ketentuan terbaru.",
    },
  ],
} as const;
