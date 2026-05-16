import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logUserEvent } from "@/lib/analytics";
import { isGuestEmail } from "@/lib/guest-user";
import { prisma } from "@/lib/prisma";
import { createSessionToken, sessionCookieName, sessionCookieOptions } from "@/lib/session";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (isGuestEmail(email)) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  await logUserEvent({
    userId: user.id,
    kind: "LOGIN_SUCCESS",
    text: "Успешный вход",
  });
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  res.cookies.set(sessionCookieName, token, sessionCookieOptions());
  return res;
}
