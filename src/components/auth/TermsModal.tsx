"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TERMS_WARGA } from "@/data/terms-warga";

export function TermsModal({
  open,
  onClose,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={TERMS_WARGA.title} className="max-w-xl">
      <p className="text-xs text-[var(--color-text-subtle)]">Diperbarui: {TERMS_WARGA.updatedAt}</p>
      <div className="mt-4 space-y-5">
        {TERMS_WARGA.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="font-semibold text-[var(--color-text)]">{section.heading}</h3>
            <p className="mt-1.5">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--color-border)] pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Tutup
        </Button>
        {onAccept && (
          <Button type="button" onClick={onAccept}>
            Saya Setuju
          </Button>
        )}
      </div>
    </Modal>
  );
}
