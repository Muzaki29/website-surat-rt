import { RT_INFO } from "@/lib/constants";

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean; error?: string }> {
  const apiUrl = process.env.EMAIL_API_URL;
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? `noreply@${RT_INFO.nama.replace(/\s/g, "").toLowerCase()}.local`;

  if (!apiUrl || !apiKey) {
    if (process.env.NODE_ENV === "production") {
      return { sent: false, error: "EMAIL_API_URL belum dikonfigurasi" };
    }
    console.info("[Email] (dev) To:", input.to, "Subject:", input.subject);
    return { sent: false, error: "EMAIL_API_URL belum dikonfigurasi" };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html ?? input.text.replace(/\n/g, "<br>"),
      }),
    });
    if (!res.ok) {
      return { sent: false, error: await res.text() };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Gagal kirim email" };
  }
}

export function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <p>Yth. ${name},</p>
    <p>Anda meminta reset kata sandi di platform ${RT_INFO.nama}.</p>
    <p><a href="${resetUrl}">Klik di sini untuk reset kata sandi</a></p>
    <p>Link berlaku 1 jam. Abaikan email ini jika Anda tidak meminta reset.</p>
  `.trim();
}
