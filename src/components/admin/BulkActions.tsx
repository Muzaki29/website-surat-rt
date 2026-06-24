"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import type { BulkResource } from "@/lib/bulk-delete";
import { bulkDeleteRequest } from "@/lib/bulk-client";
import { cn } from "@/lib/cn";

export function BulkActionBar({
  count,
  itemLabel,
  deleting,
  onClear,
  onDelete,
}: {
  count: number;
  itemLabel: string;
  deleting?: boolean;
  onClear: () => void;
  onDelete: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-3">
      <p className="text-sm font-medium text-[var(--color-text)]">
        {count} {itemLabel} dipilih
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={deleting}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
          Batal pilih
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? "Menghapus..." : `Hapus (${count})`}
        </button>
      </div>
    </div>
  );
}

export function BulkSelectAll({
  checked,
  indeterminate,
  onChange,
  label = "Pilih semua",
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate);
      }}
      onChange={onChange}
      className="h-4 w-4 cursor-pointer rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
    />
  );
}

export function BulkSelectRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label={`Pilih ${label}`}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 cursor-pointer rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
    />
  );
}

export function BulkCardSelect({
  checked,
  onChange,
  label,
  className,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        checked
          ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
        className,
      )}
    >
      <div className="flex items-start gap-3 p-5">
        <BulkSelectRow checked={checked} onChange={onChange} label={label} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function useBulkDeleteHandler({
  resource,
  selectedIds,
  itemLabel,
  clear,
  onSuccess,
}: {
  resource: BulkResource;
  selectedIds: string[];
  itemLabel: string;
  clear: () => void;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const noun = selectedIds.length === 1 ? itemLabel.replace(/s$/, "") : itemLabel;
    if (
      !confirm(
        `Hapus ${selectedIds.length} ${noun} sekaligus? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await bulkDeleteRequest(resource, selectedIds);
      clear();
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  }

  return { deleting, handleBulkDelete };
}
