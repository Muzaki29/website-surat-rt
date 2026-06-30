"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

export type CaptchaValue = {
  token: string;
  answer: string;
};

export function MathCaptcha({
  value,
  onChange,
  error,
  className,
}: {
  value: CaptchaValue;
  onChange: (value: CaptchaValue) => void;
  error?: string;
  className?: string;
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    onChange({ token: "", answer: "" });
    try {
      const res = await fetch("/api/captcha");
      if (!res.ok) return;
      const data = (await res.json()) as { token: string; question: string };
      setQuestion(data.question);
      onChange({ token: data.token, answer: "" });
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-[var(--color-text)]">Verifikasi keamanan</label>
      <div className="flex items-center gap-2">
        <div className="flex h-11 min-w-[7rem] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 font-mono text-lg font-semibold tracking-wider text-[var(--color-text)]">
          {loading ? "..." : question || "—"}
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] p-2.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          aria-label="Muat ulang captcha"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>
      <Input
        label="Jawaban"
        inputMode="numeric"
        required
        autoComplete="off"
        value={value.answer}
        onChange={(e) => onChange({ ...value, answer: e.target.value.replace(/\D/g, "") })}
        placeholder="Masukkan hasil perhitungan"
        error={error}
      />
      <p className="text-xs text-[var(--color-text-subtle)]">
        Masukkan hasil penjumlahan di atas untuk memastikan Anda bukan bot.
      </p>
    </div>
  );
}
