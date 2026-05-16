import nodemailer from "nodemailer";
import { getMailFrom, getSmtpConfig } from "@/lib/env";

type SendResult = { ok: true } | { ok: false; status: number; detail: string };

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<SendResult> {
  const cfg = getSmtpConfig();
  if (!cfg) {
    return { ok: false, status: 500, detail: "SMTP не настроен (SMTP_URL или SMTP_HOST+SMTP_USER+SMTP_PASSWORD)" };
  }
  const fromHeader = getMailFrom() || cfg.user;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { minVersion: "TLSv1.2" as const },
  });
  const html = `<p>Здравствуйте!</p><p>Чтобы задать новый пароль для КлассКассы, перейдите по ссылке (действует 1 час):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Если вы не запрашивали сброс, проигнорируйте это письмо.</p>`;
  try {
    await transporter.sendMail({
      from: fromHeader,
      to,
      subject: "Сброс пароля — КлассКасса",
      text: `Сброс пароля КлассКасса. Ссылка (1 час): ${resetUrl}`,
      html,
    });
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 502, detail: msg.slice(0, 500) };
  }
}
