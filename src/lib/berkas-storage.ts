import fs from "fs/promises";
import path from "path";
import { extFromMime } from "@/lib/berkas-constants";

const UPLOAD_ROOT = path.join(process.cwd(), "data", "uploads");

function resolveSafe(root: string, relative: string): string {
  const full = path.normalize(path.join(root, relative));
  if (!full.startsWith(path.normalize(root))) {
    throw new Error("Path tidak valid.");
  }
  return full;
}

export async function ensureUploadDirs() {
  await fs.mkdir(path.join(UPLOAD_ROOT, "temp"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_ROOT, "pengajuan"), { recursive: true });
}

export async function saveTempUpload(
  uploadId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  await ensureUploadDirs();
  const relative = `temp/${uploadId}${extFromMime(mimeType)}`;
  const full = resolveSafe(UPLOAD_ROOT, relative);
  await fs.writeFile(full, buffer);
  return relative;
}

export async function attachTempUploadsToPengajuan(
  uploadIds: string[],
  pengajuanId: string,
): Promise<Record<string, string>> {
  await ensureUploadDirs();
  const destDir = path.join(UPLOAD_ROOT, "pengajuan", pengajuanId);
  await fs.mkdir(destDir, { recursive: true });

  const tempFiles = await fs.readdir(path.join(UPLOAD_ROOT, "temp"));
  const moved: Record<string, string> = {};

  for (const uploadId of uploadIds) {
    const match = tempFiles.find((f) => f.startsWith(uploadId));
    if (!match) continue;

    const src = path.join(UPLOAD_ROOT, "temp", match);
    const dest = path.join(destDir, match);
    await fs.rename(src, dest);
    moved[uploadId] = `pengajuan/${pengajuanId}/${match}`;
  }

  return moved;
}

export function getUploadAbsolutePath(relativePath: string): string {
  return resolveSafe(UPLOAD_ROOT, relativePath);
}

export async function readUploadBuffer(relativePath: string): Promise<Buffer> {
  return fs.readFile(getUploadAbsolutePath(relativePath));
}
