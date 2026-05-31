const SIGNATURES: { mime: string; check: (buf: Buffer) => boolean }[] = [
  { mime: "image/jpeg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: "image/gif",
    check: (b) => b.slice(0, 6).toString("ascii") === "GIF87a" || b.slice(0, 6).toString("ascii") === "GIF89a",
  },
  {
    mime: "image/webp",
    check: (b) => b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP",
  },
  { mime: "application/pdf", check: (b) => b.slice(0, 5).toString("ascii") === "%PDF-" },
];

export function detectReceiptMime(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (sig.check(buffer)) return sig.mime;
  }
  return null;
}

/** Проверяет, что содержимое файла соответствует заявленному MIME и допустимому типу чека. */
export function validateReceiptBuffer(buffer: Buffer, declaredMime: string): { ok: true; mime: string } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "Файл пустой" };
  }

  const detected = detectReceiptMime(buffer);
  if (!detected) {
    return { ok: false, error: "Файл не похож на изображение или PDF. Загрузите фото чека или PDF." };
  }

  const declaredBase = declaredMime.split(";")[0]?.trim().toLowerCase();
  const detectedBase = detected.split(";")[0]?.trim().toLowerCase();
  if (declaredBase && declaredBase !== detectedBase) {
    return { ok: false, error: "Тип файла не совпадает с содержимым. Загрузите настоящий чек (JPEG, PNG, WebP, GIF или PDF)." };
  }

  return { ok: true, mime: detected };
}
