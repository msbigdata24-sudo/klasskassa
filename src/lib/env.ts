/** Session signing secret — in production must be set via env. */
export function getSessionSecret() {
  if (process.env.NODE_ENV === "production") {
    const s = process.env.SESSION_SECRET;
    if (!s || s.length < 16) {
      throw new Error("SESSION_SECRET must be set in production (min 16 characters)");
    }
    return s;
  }
  return process.env.SESSION_SECRET ?? "__dev_only_change_in_prod_32bytes!__";
}

/** Optional webhook shared secret for payments callbacks. */
export function getPaymentsWebhookSecret() {
  const s = process.env.PAYMENTS_WEBHOOK_SECRET;
  if (!s) return null;
  const trimmed = s.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Comma-separated list from METRICS_ADMIN_EMAIL (trimmed, lowercased). */
export function getMetricsAdminEmails(): string[] {
  const s = process.env.METRICS_ADMIN_EMAIL;
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x.length > 0);
}

/** First configured metrics admin email, or null if none. */
export function getMetricsAdminEmail() {
  const list = getMetricsAdminEmails();
  return list[0] ?? null;
}

export function isMetricsAdminEmail(email: string) {
  const e = email.trim().toLowerCase();
  return getMetricsAdminEmails().includes(e);
}

export function getPushVapidPublicKey() {
  const s = process.env.PUSH_VAPID_PUBLIC_KEY;
  if (!s) return null;
  const trimmed = s.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPushVapidPrivateKey() {
  const s = process.env.PUSH_VAPID_PRIVATE_KEY;
  if (!s) return null;
  const trimmed = s.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPushVapidSubject() {
  const s = process.env.PUSH_VAPID_SUBJECT;
  if (!s) return "mailto:support@apelsin.local";
  const trimmed = s.trim();
  return trimmed.length > 0 ? trimmed : "mailto:support@apelsin.local";
}

/** Публичный URL сайта (ссылки в письмах). Пример: https://myapelsin.com */
export function getAppBaseUrl() {
  const raw = process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_BASE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

/** Настройки SMTP (сброс пароля и др. письма). Подходит для Яндекс 360, Mail.ru, Timeweb и т.д. */
export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const urlRaw = process.env.SMTP_URL?.trim();
  if (urlRaw) {
    try {
      const u = new URL(urlRaw);
      const user = decodeURIComponent(u.username || "");
      const pass = decodeURIComponent(u.password || "");
      if (!u.hostname || !user || !pass) return null;
      const port = u.port ? parseInt(u.port, 10) : u.protocol === "smtps:" ? 465 : 587;
      const secure = u.protocol === "smtps:" || port === 465;
      return { host: u.hostname, port, secure, user, pass };
    } catch {
      return null;
    }
  }
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = (process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS)?.trim();
  if (!host || !user || !pass) return null;
  const port = Math.max(1, parseInt(process.env.SMTP_PORT?.trim() || "587", 10) || 587);
  const sec = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = sec === "true" || sec === "1" || port === 465;
  return { host, port, secure, user, pass };
}

export function isPasswordResetMailConfigured(): boolean {
  return getSmtpConfig() !== null;
}

/**
 * Заголовок From для писем. Если пусто — берётся SMTP_USER (часто требуют почтовики РФ).
 * Пример: «Апельсин» <robot@yourdomain.ru>
 */
export function getMailFrom(): string | null {
  const s = process.env.MAIL_FROM?.trim();
  return s && s.length > 0 ? s : null;
}
