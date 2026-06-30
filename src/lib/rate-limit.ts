import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const now = Date.now();
  const bucketKey = key.slice(0, 120);
  const row = await prisma.rateLimitBucket.findUnique({ where: { key: bucketKey } });

  if (!row) {
    await prisma.rateLimitBucket.create({
      data: {
        id: createId(),
        key: bucketKey,
        count: 1,
        windowStart: new Date(now).toISOString(),
      },
    });
    return { allowed: true };
  }

  const windowStart = new Date(row.windowStart).getTime();
  if (now - windowStart > WINDOW_MS) {
    await prisma.rateLimitBucket.update({
      where: { key: bucketKey },
      data: { count: 1, windowStart: new Date(now).toISOString() },
    });
    return { allowed: true };
  }

  if (row.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  await prisma.rateLimitBucket.update({
    where: { key: bucketKey },
    data: { count: row.count + 1 },
  });
  return { allowed: true };
}
