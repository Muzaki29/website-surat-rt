import { RT_INFO } from "@/lib/constants";

export interface NotificationPayload {
  to: string;
  message: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppNotification(payload: NotificationPayload): Promise<{
  sent: boolean;
  manualLink?: string;
}> {
  const manualLink = buildWhatsAppLink(payload.to, payload.message);
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!apiUrl || !token) {
    console.info("[WhatsApp] Manual link:", manualLink);
    return { sent: false, manualLink };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: normalizePhone(payload.to),
        message: payload.message,
      }),
    });

    if (!res.ok) {
      console.error("[WhatsApp] API error", await res.text());
      return { sent: false, manualLink };
    }

    return { sent: true, manualLink };
  } catch (error) {
    console.error("[WhatsApp]", error);
    return { sent: false, manualLink };
  }
}

export function formatPengajuanNotification(nama: string, jenis: string, id: string): string {
  return (
    `[${RT_INFO.nama}] Pengajuan surat baru dari ${nama} (${jenis.replace(/-/g, " ")}). ` +
    `Lacak status: ${process.env.AUTH_URL ?? "http://localhost:3000"}/status/${id}`
  );
}

export function formatPembayaranNotification(nama: string, nominal: number, periode: string): string {
  return (
    `[${RT_INFO.nama}] Bukti pembayaran iuran ${periode} dari ${nama} sebesar Rp ${nominal.toLocaleString("id-ID")} ` +
    `menunggu konfirmasi Bendahara RT.`
  );
}

export function formatStatusPengajuanNotification(nama: string, status: string, id: string): string {
  return (
    `[${RT_INFO.nama}] Pengajuan surat Anda (${nama}) status: ${status.toUpperCase()}. ` +
    `Detail: ${process.env.AUTH_URL ?? "http://localhost:3000"}/status/${id}`
  );
}
