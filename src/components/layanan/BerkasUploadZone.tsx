"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, ScanLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JENIS_BERKAS_OPTIONS } from "@/lib/berkas-constants";
import type { ExtractedBerkasResult, JenisBerkasPengajuan } from "@/lib/types";

export interface BerkasUploadItem {
  uploadId: string;
  jenis: JenisBerkasPengajuan;
  namaFile: string;
  mimeType: string;
}

export function BerkasUploadZone({
  onExtracted,
  uploads,
  onUploadsChange,
}: {
  onExtracted: (data: ExtractedBerkasResult) => void;
  uploads: BerkasUploadItem[];
  onUploadsChange: (items: BerkasUploadItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jenis, setJenis] = useState<JenisBerkasPengajuan>("ktp");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setStatus("");
    setScanning(true);

    const form = new FormData();
    form.append("file", file);
    form.append("jenis", jenis);

    try {
      const res = await fetch("/api/pengajuan/extract", { method: "POST", body: form });
      const data = (await res.json()) as ExtractedBerkasResult & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Gagal mengunggah berkas.");
        return;
      }

      onUploadsChange([
        ...uploads,
        {
          uploadId: data.uploadId,
          jenis: data.jenis,
          namaFile: data.namaFile,
          mimeType: data.mimeType,
        },
      ]);

      onExtracted(data);
      setStatus(data.message);
    } catch {
      setError("Gagal mengunggah berkas. Periksa koneksi.");
    } finally {
      setScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeUpload(uploadId: string) {
    onUploadsChange(uploads.filter((u) => u.uploadId !== uploadId));
  }

  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-5">
      <div className="flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-[var(--color-accent)]" />
        <h3 className="font-semibold">Unggah Berkas Warga</h3>
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Upload foto KTP atau KK — sistem akan membaca NIK, nama, dan alamat secara otomatis
        (OCR + cocokkan data warga RT).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {JENIS_BERKAS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setJenis(opt.id)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              jenis === opt.id
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={scanning}
          onClick={() => inputRef.current?.click()}
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menganalisis berkas...
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" />
              Pilih & Unggah Berkas
            </>
          )}
        </Button>
        <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
          JPG, PNG, WEBP, atau PDF · maks. 5 MB · OCR terbaik untuk foto KTP/KK
        </p>
      </div>

      {status && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {status}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2">
          {uploads.map((u) => (
            <li
              key={u.uploadId}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{u.namaFile}</p>
                <p className="text-xs text-[var(--color-text-subtle)] uppercase">{u.jenis}</p>
              </div>
              <button
                type="button"
                onClick={() => removeUpload(u.uploadId)}
                className="shrink-0 cursor-pointer rounded p-1 text-red-500 hover:bg-red-50"
                aria-label="Hapus berkas"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
