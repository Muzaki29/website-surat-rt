import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backupRoot = join(root, "backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const targetDir = join(backupRoot, stamp);

function resolveDbPath() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const relative = url.replace(/^file:/, "").replace(/^\.\//, "");
  const candidates = [
    join(root, relative),
    join(root, "prisma", relative),
    join(root, "prisma", "dev.db"),
  ];
  return candidates.find((p) => existsSync(p));
}

function copyIfExists(src, destName) {
  if (!existsSync(src)) return false;
  copyFileSync(src, join(targetDir, destName));
  return true;
}

mkdirSync(targetDir, { recursive: true });

const dbPath = resolveDbPath();
if (dbPath) {
  copyIfExists(dbPath, "dev.db");
  console.log(`Database: ${dbPath}`);
} else {
  console.warn("Database SQLite tidak ditemukan — lewati backup DB.");
}

const jsonDir = join(root, "data", "db");
if (existsSync(jsonDir)) {
  const jsonBackup = join(targetDir, "json");
  mkdirSync(jsonBackup, { recursive: true });
  for (const file of readdirSync(jsonDir)) {
    const full = join(jsonDir, file);
    if (statSync(full).isFile()) {
      copyFileSync(full, join(jsonBackup, file));
    }
  }
  console.log(`JSON legacy: ${jsonDir}`);
}

console.log(`Backup tersimpan di: ${targetDir}`);
