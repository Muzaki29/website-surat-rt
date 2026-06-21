/** Parse JSON response safely — avoids crash when server returns empty body (500). */
export async function parseJsonResponse<T = Record<string, unknown>>(
  res: Response,
): Promise<{ data: T | null; text: string }> {
  const text = await res.text();
  if (!text) return { data: null, text: "" };
  try {
    return { data: JSON.parse(text) as T, text };
  } catch {
    return { data: null, text };
  }
}
