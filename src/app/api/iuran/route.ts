import { NextResponse } from "next/server";
import { JENIS_IURAN, RT_INFO } from "@/lib/constants";
import {
  getWargaFromSession,
  requirePermission,
  requireSession,
  requireWarga,
} from "@/lib/auth-api";
import { METODE_PEMBAYARAN_LABEL } from "@/lib/keluarga";
import { createId } from "@/lib/id";
import { createNotifikasi } from "@/lib/notifikasi";
import {
  formatPembayaranNotification,
  sendWhatsAppNotification,
} from "@/lib/notifications";
import { formatRupiah } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { readJson, writeJson } from "@/lib/storage";
import type { PeranPengguna, TagihanIuran, TransaksiKas, Warga } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const me = url.searchParams.get("me");
  const nik = url.searchParams.get("nik");
  const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);

  if (me === "1") {
    const auth = await requireWarga();
    if (auth.error) return auth.error;
    const warga = await getWargaFromSession(auth.session!);
    if (!warga) {
      return NextResponse.json({ error: "Data warga tidak ditemukan" }, { status: 404 });
    }
    const milik = tagihan.filter((t) => t.wargaId === warga.id);
    return NextResponse.json({ warga, tagihan: milik });
  }

  if (nik) {
    const auth = await requireSession();
    if (auth.error) return auth.error;
    const role = auth.session!.user.role as PeranPengguna;
    if (!hasPermission(role, "warga:read")) {
      const own = await getWargaFromSession(auth.session!);
      if (!own || own.nik !== nik) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const warga = await readJson<Warga[]>("warga.json", []);
    const found = warga.find((w) => w.nik === nik);
    if (!found) {
      return NextResponse.json({ error: "NIK tidak ditemukan" }, { status: 404 });
    }
    const milik = tagihan.filter((t) => t.wargaId === found.id);
    return NextResponse.json({ warga: found, tagihan: milik });
  }

  const auth = await requirePermission("iuran:read");
  if (auth.error) return auth.error;

  return NextResponse.json(tagihan);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "generate") {
    const auth = await requirePermission("iuran:manage");
    if (auth.error) return auth.error;

    const warga = await readJson<Warga[]>("warga.json", []);
    const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
    const periode = body.periode ?? new Date().toISOString().slice(0, 7);
    const jenisId = body.jenisIuran ?? "ipl";
    const jenis = JENIS_IURAN.find((j) => j.id === jenisId) ?? JENIS_IURAN[0];

    const aktif = warga.filter((w) => w.status === "aktif");
    const baru: TagihanIuran[] = [];

    for (const w of aktif) {
      const exists = tagihan.some(
        (t) => t.wargaId === w.id && t.periode === periode && t.jenisIuran === jenis.nama,
      );
      if (exists) continue;

      baru.push({
        id: createId(),
        wargaId: w.id,
        wargaNama: w.nama,
        jenisIuran: jenis.nama,
        periode,
        nominal: jenis.nominal,
        status: "belum-bayar",
      });
    }

    const combined = [...tagihan, ...baru];
    await writeJson("iuran.json", combined);
    return NextResponse.json({ created: baru.length, tagihan: combined });
  }

  if (body.action === "ajukan-bayar") {
    const auth = await requireWarga();
    if (auth.error) return auth.error;

    const warga = await getWargaFromSession(auth.session!);
    if (!warga) {
      return NextResponse.json({ error: "Data warga tidak ditemukan" }, { status: 404 });
    }

    const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
    const index = tagihan.findIndex((t) => t.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }
    if (tagihan[index].wargaId !== warga.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (tagihan[index].status !== "belum-bayar") {
      return NextResponse.json({ error: "Tagihan tidak dapat dibayar" }, { status: 400 });
    }

    tagihan[index] = {
      ...tagihan[index],
      status: "menunggu-konfirmasi",
      metodePembayaran: body.metodePembayaran,
      kodeReferensi: body.kodeReferensi ?? "",
      catatanPembayaran: body.catatanPembayaran ?? "",
      tanggalAjuanBayar: new Date().toISOString().slice(0, 10),
    };

    await writeJson("iuran.json", tagihan);

    const metodeLabel =
      METODE_PEMBAYARAN_LABEL[tagihan[index].metodePembayaran ?? ""] ??
      tagihan[index].metodePembayaran ??
      "Manual";

    await createNotifikasi({
      tipe: "pembayaran",
      judul: `Pembayaran ${metodeLabel} menunggu konfirmasi`,
      pesan: `${tagihan[index].wargaNama} mengajukan bayar ${formatRupiah(tagihan[index].nominal)} (${tagihan[index].periode}) via ${metodeLabel}. Ref: ${tagihan[index].kodeReferensi || "—"}`,
      href: "/admin/iuran",
      level: "warning",
      meta: {
        tagihanId: tagihan[index].id,
        metode: tagihan[index].metodePembayaran,
        nominal: tagihan[index].nominal,
      },
    });

    const phone = process.env.WHATSAPP_DEFAULT_PHONE || RT_INFO.telepon;
    await sendWhatsAppNotification({
      to: phone,
      message: formatPembayaranNotification(
        tagihan[index].wargaNama,
        tagihan[index].nominal,
        tagihan[index].periode,
      ),
    });

    return NextResponse.json(tagihan[index]);
  }

  if (body.action === "bayar") {
    body.action = "konfirmasi";
  }

  if (body.action === "konfirmasi") {
    const auth = await requirePermission("iuran:manage");
    if (auth.error) return auth.error;

    const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
    const kas = await readJson<TransaksiKas[]>("kas.json", []);
    const index = tagihan.findIndex((t) => t.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    tagihan[index] = {
      ...tagihan[index],
      status: "lunas",
      tanggalBayar: new Date().toISOString().slice(0, 10),
    };

    kas.unshift({
      id: createId(),
      tanggal: new Date().toISOString().slice(0, 10),
      jenis: "pemasukan",
      kategori: "Iuran Warga",
      keterangan: `${tagihan[index].jenisIuran} — ${tagihan[index].wargaNama} (${tagihan[index].periode})`,
      nominal: tagihan[index].nominal,
    });

    await writeJson("iuran.json", tagihan);
    await writeJson("kas.json", kas);

    await createNotifikasi({
      tipe: "pembayaran",
      judul: "Pembayaran iuran dikonfirmasi",
      pesan: `${tagihan[index].wargaNama} — ${formatRupiah(tagihan[index].nominal)} (${tagihan[index].periode}) lunas.`,
      href: "/admin/iuran",
      level: "success",
      meta: { tagihanId: tagihan[index].id },
    });

    return NextResponse.json(tagihan[index]);
  }

  if (body.action === "tolak") {
    const auth = await requirePermission("iuran:manage");
    if (auth.error) return auth.error;

    const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
    const index = tagihan.findIndex((t) => t.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    tagihan[index] = {
      ...tagihan[index],
      status: "ditolak",
    };

    await writeJson("iuran.json", tagihan);
    return NextResponse.json(tagihan[index]);
  }

  return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
}
