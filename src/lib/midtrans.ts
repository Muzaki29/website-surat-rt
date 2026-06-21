import { createId } from "@/lib/id";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

export function isMidtransEnabled(): boolean {
  return Boolean(SERVER_KEY);
}

export interface MidtransSnapPayload {
  orderId: string;
  grossAmount: number;
  customerName: string;
  itemName: string;
}

export async function createSnapToken(payload: MidtransSnapPayload): Promise<string | null> {
  if (!SERVER_KEY) return null;

  const auth = Buffer.from(`${SERVER_KEY}:`).toString("base64");
  const res = await fetch(`${BASE_URL}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: payload.orderId,
        gross_amount: payload.grossAmount,
      },
      customer_details: {
        first_name: payload.customerName,
      },
      item_details: [
        {
          id: payload.orderId,
          price: payload.grossAmount,
          quantity: 1,
          name: payload.itemName.slice(0, 50),
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Midtrans]", err);
    return null;
  }

  const data = (await res.json()) as { token?: string };
  return data.token ?? null;
}

export function buildOrderId(tagihanId: string): string {
  return `IURAN-${tagihanId.slice(0, 8)}-${createId().slice(0, 6)}`.toUpperCase();
}
