import { createWorker } from "tesseract.js";
import { isOcrSupported } from "@/lib/berkas-constants";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker("ind", 1, {
        logger: () => {},
      });
      return worker;
    })();
  }
  return workerPromise;
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(buffer);
  return text;
}

export async function ocrBuffer(buffer: Buffer, mimeType: string): Promise<string | null> {
  if (!isOcrSupported(mimeType)) return null;
  try {
    return await extractTextFromImage(buffer);
  } catch (error) {
    console.error("[ocr]", error);
    return null;
  }
}
