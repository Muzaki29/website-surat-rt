import { readJson, writeJson } from "@/lib/storage";

type Counter = { keluar: number; masuk: number };

async function readCounter(): Promise<Counter> {
  return readJson<Counter>("counter.json", { keluar: 0, masuk: 0 });
}

export async function generateNomorSurat(): Promise<string> {
  const counter = await readCounter();
  counter.keluar += 1;
  await writeJson("counter.json", counter);

  const now = new Date();
  return `${String(counter.keluar).padStart(3, "0")}/RT/${now.getMonth() + 1}/${now.getFullYear()}`;
}

export async function generateNomorAgenda(): Promise<string> {
  const counter = await readCounter();
  counter.masuk += 1;
  await writeJson("counter.json", counter);

  return `AG-${new Date().getFullYear()}-${String(counter.masuk).padStart(4, "0")}`;
}
