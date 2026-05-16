import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logUserEvent } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sessionCookieName } from "@/lib/session";

const schema = z.object({
  password: z.string().min(1).max(200),
  confirm: z.literal(true).optional(),
});

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Сессия не найдена" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Не удалось обработать запрос" }, { status: 400 });
  }
  if (parsed.data.confirm !== true) {
    return NextResponse.json({ error: "Подтвердите удаление аккаунта" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: current.id },
    select: { id: true, passwordHash: true, email: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  const ok = await bcrypt.compare(parsed.data.password, dbUser.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const userId = dbUser.id;
  const anonymizedEmail = `deleted-${userId}@apelsin.deleted`;
  const anonymizedName = "Удалённый пользователь";
  const anonymizedHash = "deleted-account-no-login";

  await prisma.$transaction(async (tx) => {
    // 1) Удаляем сугубо личную переписку и push-инфраструктуру.
    await tx.groupMessage.deleteMany({ where: { authorId: userId } });
    await tx.directMessage.deleteMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    });
    await tx.directMessageRead.deleteMany({ where: { userId } });
    await tx.pushSubscription.deleteMany({ where: { userId } });
    await tx.userNotificationSettings.deleteMany({ where: { userId } });
    await tx.friendLink.deleteMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
    });
    await tx.requestDedup.deleteMany({ where: { userId } });
    await tx.giftClaim.deleteMany({ where: { claimedByUserId: userId } });
    await tx.secretSantaParticipant.deleteMany({ where: { userId } });

    // 2) В журнале событий обезличиваем автора (актора), сами события сохраняем.
    await tx.activityEvent.updateMany({
      where: { actorId: userId },
      data: { actorId: null },
    });

    // 3) Обезличиваем сам аккаунт. Финансовые записи (Expense.payer,
    //    ExpenseSplit.user, Settlement.fromUser/toUser, GroupMember и т.п.)
    //    остаются на месте — иначе сломается история расчётов у других
    //    участников групп. В UI эти записи будут показываться как
    //    "Удалённый пользователь".
    await tx.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        name: anonymizedName,
        passwordHash: anonymizedHash,
        isPro: false,
        proUntil: null,
      },
    });
  });

  await logUserEvent({
    userId,
    kind: "ACCOUNT_DELETED",
    text: "Пользователь удалил аккаунт (обезличен)",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
