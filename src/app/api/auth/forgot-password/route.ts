import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppBaseUrl, isPasswordResetMailConfigured } from "@/lib/env";
import { isGuestEmail } from "@/lib/guest-user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email().max(255),
});

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите корректный email" }, { status: 400 });
  }

  if (process.env.NODE_ENV === "production" && !isPasswordResetMailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Сброс пароля по почте на сервере пока не настроен (нужен SMTP). Напишите в поддержку или администратору сайта.",
      },
      { status: 503 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  const generic = NextResponse.json({
    ok: true,
    message:
      "Если такой email зарегистрирован, мы отправили на него ссылку для сброса пароля. Проверьте почту (и папку «Спам»). Ссылка действует 1 час.",
  });

  if (!user || isGuestEmail(user.email)) {
    return generic;
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const base = getAppBaseUrl();
  const resetUrl = `${base}/reset-password?t=${encodeURIComponent(raw)}`;

  if (!isPasswordResetMailConfigured()) {
    console.info(`[forgot-password] DEV: reset link for ${user.email}\n${resetUrl}`);
    return NextResponse.json({
      ok: true,
      message:
        "Режим разработки: SMTP не настроен. Ссылка для сброса выведена в консоль сервера (терминал, где запущен next dev).",
    });
  }

  const sent = await sendPasswordResetEmail(user.email, resetUrl);
  if (!sent.ok) {
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
    console.error("[forgot-password] SMTP error:", sent.status, sent.detail);
    return NextResponse.json(
      { error: "Не удалось отправить письмо. Попробуйте позже или напишите в поддержку." },
      { status: 502 },
    );
  }

  return generic;
}
