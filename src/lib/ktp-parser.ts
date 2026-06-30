export interface ExtractedIdentity {
  nik?: string;
  noKk?: string;
  namaPemohon?: string;
  alamat?: string;
}

function titleCaseName(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function cleanLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Parse teks OCR dari KTP/KK Indonesia ke field formulir. */
export function parseIdentityDocument(text: string): ExtractedIdentity {
  const lines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const joined = lines.join("\n");
  const upper = joined.toUpperCase();

  let nik: string | undefined;
  const nikMatch = upper.match(/\bNIK\s*[:\-]?\s*(\d{16})\b/);
  if (nikMatch) {
    nik = nikMatch[1];
  } else {
    const genericNik = upper.match(/\b(\d{16})\b/);
    if (genericNik) nik = genericNik[1];
  }

  let noKk: string | undefined;
  const kkPatterns = [
    /NO\.?\s*(?:\.\s*)?(?:KK)?\s*[:\-]?\s*(\d{16})/i,
    /NOMOR\s*(?:KARTU\s*KELUARGA|KK)\s*[:\-]?\s*(\d{16})/i,
    /KARTU\s*KELUARGA[\s\S]{0,120}?(\d{16})/i,
  ];
  for (const pattern of kkPatterns) {
    const m = joined.match(pattern);
    if (m) {
      noKk = m[1];
      break;
    }
  }
  if (!noKk && /KARTU\s*KELUARGA|KARTU KELUARGA/i.test(upper)) {
    const all16 = upper.match(/\b(\d{16})\b/g);
    if (all16 && all16.length > 0) {
      noKk = all16[0];
      if (nik && noKk === nik && all16.length > 1) noKk = all16[1];
    }
  }

  let namaPemohon: string | undefined;
  const namaPatterns = [
    /NAMA\s*[:\-]?\s*([A-Z][A-Z\s.'`]{2,60})/i,
    /NAME\s*[:\-]?\s*([A-Z][A-Z\s.'`]{2,60})/i,
  ];
  for (const pattern of namaPatterns) {
    const m = upper.match(pattern);
    if (m) {
      namaPemohon = titleCaseName(cleanLine(m[1].replace(/[^A-Z\s.'`]/gi, "")));
      break;
    }
  }

  if (!namaPemohon) {
    const idx = lines.findIndex((l) => /^nama$/i.test(l) || /^name$/i.test(l));
    if (idx >= 0 && lines[idx + 1]) {
      namaPemohon = titleCaseName(lines[idx + 1]);
    }
  }

  let alamat: string | undefined;
  const alamatPatterns = [
    /ALAMAT\s*[:\-]?\s*([\s\S]+?)(?:\n\s*(?:RT\/|RT\.|RW\/|RW\.|KEL\/|KEL\.|KEC\/|AGAMA|PEKERJAAN|STATUS)|$)/i,
  ];
  for (const pattern of alamatPatterns) {
    const m = joined.match(pattern);
    if (m) {
      alamat = cleanLine(m[1].replace(/\s+/g, " "));
      if (alamat.length > 10) break;
      alamat = undefined;
    }
  }

  if (!alamat) {
    const idx = lines.findIndex((l) => /^alamat$/i.test(l));
    if (idx >= 0) {
      const parts: string[] = [];
      for (let i = idx + 1; i < lines.length && parts.length < 3; i++) {
        const line = lines[i];
        if (/^(RT|RW|KEL|KEC|AGAMA|STATUS|PEKERJAAN)/i.test(line)) break;
        parts.push(line);
      }
      if (parts.length) alamat = cleanLine(parts.join(", "));
    }
  }

  return { nik, noKk, namaPemohon, alamat };
}

export function mergeExtracted(
  ocr: ExtractedIdentity,
  warga?: { nama: string; nik: string; noKk?: string; alamat: string } | null,
): ExtractedIdentity & { source: string[] } {
  const source: string[] = [];
  const result: ExtractedIdentity = { ...ocr };

  if (ocr.nik) source.push("ocr");
  if (warga) {
    if (!result.nik || result.nik === warga.nik) {
      result.nik = warga.nik;
      result.namaPemohon = warga.nama;
      result.alamat = warga.alamat;
      if (warga.noKk) result.noKk = warga.noKk;
      if (!source.includes("warga-db")) source.push("warga-db");
    }
  }

  if (ocr.namaPemohon && !warga) source.push("ocr-nama");
  if (ocr.alamat && !warga) source.push("ocr-alamat");

  return { ...result, source };
}
