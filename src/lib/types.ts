export type StatusSurat =
  | "draft"
  | "diajukan"
  | "diproses"
  | "disetujui"
  | "ditolak"
  | "selesai";

export type JenisSurat =
  | "surat-keterangan-domisili"
  | "surat-keterangan-tidak-mampu"
  | "surat-pengantar-nikah"
  | "surat-keterangan-usaha"
  | "surat-keterangan-belum-menikah"
  | "surat-pengantar-skck"
  | "surat-keterangan-ahli-waris"
  | "surat-lainnya";

export type PeranPengguna =
  | "ketua-rt"
  | "sekretaris-rt"
  | "bendahara-rt"
  | "warga"
  | "admin";

export interface JenisSuratInfo {
  slug: JenisSurat;
  nama: string;
  deskripsi: string;
  estimasiHari: number;
  persyaratan: string[];
}

export interface SuratMasuk {
  id: string;
  nomorAgenda: string;
  tanggalTerima: string;
  pengirim: string;
  perihal: string;
  status: StatusSurat;
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tujuan: string;
  perihal: string;
  status: StatusSurat;
}

export interface PengajuanSurat {
  id: string;
  jenisSurat: JenisSurat;
  namaPemohon: string;
  nik: string;
  alamat: string;
  keperluan: string;
  tanggalAjuan: string;
  status: StatusSurat;
}

export interface StatistikDashboard {
  suratMasukBulanIni: number;
  suratKeluarBulanIni: number;
  pengajuanMenunggu: number;
  pengajuanSelesai: number;
}

export type StatusWarga = "aktif" | "nonaktif" | "menunggu-verifikasi";

export interface Warga {
  id: string;
  nama: string;
  nik: string;
  alamat: string;
  noHp: string;
  status: StatusWarga;
  tanggalMasuk: string;
  userId?: string;
}

export type StatusTagihan = "belum-bayar" | "menunggu-konfirmasi" | "lunas" | "ditolak";

export type MetodePembayaran = "transfer-bank" | "qris" | "tunai";

export interface TagihanIuran {
  id: string;
  wargaId: string;
  wargaNama: string;
  jenisIuran: string;
  periode: string;
  nominal: number;
  status: StatusTagihan;
  tanggalBayar?: string;
  metodePembayaran?: MetodePembayaran;
  kodeReferensi?: string;
  catatanPembayaran?: string;
  tanggalAjuanBayar?: string;
}

export type JenisTransaksi = "pemasukan" | "pengeluaran";

export interface TransaksiKas {
  id: string;
  tanggal: string;
  jenis: JenisTransaksi;
  kategori: string;
  keterangan: string;
  nominal: number;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  penulis: string;
  published: boolean;
}

export interface DashboardStats {
  totalWarga: number;
  wargaAktif: number;
  tagihanBelumBayar: number;
  pembayaranMenunggu: number;
  saldoKas: number;
  pengumumanAktif: number;
  suratMasukBulanIni: number;
  suratKeluarBulanIni: number;
  pengajuanMenunggu: number;
  pengajuanSelesai: number;
  tiketSupportTerbuka: number;
}

export type StatusTiket = "terbuka" | "diproses" | "selesai";

export interface TiketSupport {
  id: string;
  nama: string;
  kontak: string;
  topik: string;
  pesan: string;
  tanggal: string;
  status: StatusTiket;
  balasan?: string;
  tanggalBalasan?: string;
}

export type StatusPolling = "draft" | "aktif" | "selesai";

export interface PollingOpsi {
  id: string;
  label: string;
  votes: number;
}

export interface Polling {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: StatusPolling;
  opsi: PollingOpsi[];
}

export interface ArsipItem {
  id: string;
  jenis: "surat-masuk" | "surat-keluar" | "pengajuan";
  nomor: string;
  tanggal: string;
  subjek: string;
  pihak: string;
  status: string;
}

export interface ForumThread {
  id: string;
  judul: string;
  penulisUserId: string;
  penulisNama: string;
  createdAt: string;
  updatedAt: string;
  pesanTerakhir?: string;
  jumlahPesan?: number;
}

export interface ForumMessage {
  id: string;
  threadId: string;
  penulisUserId: string;
  penulisNama: string;
  isi: string;
  createdAt: string;
}
