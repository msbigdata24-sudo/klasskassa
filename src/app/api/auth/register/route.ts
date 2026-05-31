import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logUserEvent } from "@/lib/analytics";
import { isGuestEmail } from "@/lib/guest-user";
import { passwordSchema } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import { createSessionToken, sessionCookieName, sessionCookieOptions } from "@/lib/session";

const schema = z.object({
  email: z.string().email().max(255),
  password: passwordSchema,
  name: z.string().min(1).max(80),
  consent: z.literal(true).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.password?.[0] ?? "Проверьте email, имя и пароль";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (parsed.data.consent !== true) {
    return NextResponse.json(
      { error: "Подтвердите согласие с Политикой конфиденциальности и Пользовательским соглашением" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (isGuestEmail(email)) {
    return NextResponse.json({ error: "Этот домен зарезервирован — используйте другой email" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Этот email уже зарегистрирован" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name.trim(),
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  const token = await createSessionToken(user.id);
  await logUserEvent({
    userId: user.id,
    kind: "REGISTER_SUCCESS",
    text: "Успешная регистрация",
  });
  const res = NextResponse.json({ user });
  res.cookies.set(sessionCookieName, token, sessionCookieOptions());
  return res;
}
