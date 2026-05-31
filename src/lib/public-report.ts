/** Срок жизни публичной ссылки отчёта по умолчанию (дней). */
export const PUBLIC_REPORT_TTL_DAYS = 180;

export function defaultReportExpiresAt(from = new Date()) {
  return new Date(from.getTime() + PUBLIC_REPORT_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export type ReportAccessResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "disabled" | "expired" };

export function checkPublicReportAccess(collection: {
  publicReportEnabled: boolean;
  publicReportExpiresAt: Date | null;
}): ReportAccessResult {
  if (!collection.publicReportEnabled) return { ok: false, reason: "disabled" };
  if (collection.publicReportExpiresAt && collection.publicReportExpiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true };
}

export function reportAccessMessage(reason: "not_found" | "disabled" | "expired"): string {
  switch (reason) {
    case "disabled":
      return "Публичная ссылка отключена родительским комитетом.";
    case "expired":
      return "Срок действия публичной ссылки истёк. Попросите родком обновить ссылку.";
    default:
      return "Отчёт не найден.";
  }
}
