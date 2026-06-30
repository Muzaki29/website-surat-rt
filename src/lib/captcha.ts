import crypto from "crypto";

const TTL_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET tidak dikonfigurasi.");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createMathCaptcha(): { question: string; token: string } {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = a + b;
  const exp = Date.now() + TTL_MS;
  const payload = `${answer}:${exp}`;
  const token = Buffer.from(`${payload}:${sign(payload)}`).toString("base64url");
  return { question: `${a} + ${b} = ?`, token };
}

export function verifyMathCaptcha(token: string, answer: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;

    const sig = decoded.slice(lastColon + 1);
    const rest = decoded.slice(0, lastColon);
    const expColon = rest.lastIndexOf(":");
    if (expColon === -1) return false;

    const expectedAnswer = rest.slice(0, expColon);
    const exp = rest.slice(expColon + 1);
    const payload = `${expectedAnswer}:${exp}`;

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(sign(payload), "hex");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return false;
    }

    if (Date.now() > Number(exp)) return false;
    return expectedAnswer === String(answer).trim();
  } catch {
    return false;
  }
}
