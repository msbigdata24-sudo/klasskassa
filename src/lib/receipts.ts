export const RECEIPT_RETENTION_DAYS = 90;

export function receiptRetentionCutoff(now = new Date()) {
  return new Date(now.getTime() - RECEIPT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function receiptRetentionText() {
  return `Чеки хранятся ${RECEIPT_RETENTION_DAYS} дней с момента загрузки. Если нужен долгий архив, скачайте файл и сохраните чеки у себя.`;
}
