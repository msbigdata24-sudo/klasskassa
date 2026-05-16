import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(16).max(200),
  password: z.string().min(6).max(200),
});

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте ссылку и пароль (не короче 6 символов)" }, { status: 400 });
  }

  const tokenHash = hashToken(parsed.data.token.trim());
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!row || row.usedAt) {
    return NextResponse.json({ error: "Ссылка недействительна или уже использована. Запросите сброс пароля снова." }, { status: 400 });
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: row.id } }).catch(() => {});
    return NextResponse.json({ error: "Срок ссылки истёк. Запросите сброс пароля снова." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: row.userId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
