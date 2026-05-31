import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership } from "@/lib/class-access";
import { canOptInEmailReminders } from "@/lib/member-roles";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  emailRemindersOptIn: z.boolean(),
});

export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { id: classId } = await params;
  const membership = await getClassMembership(classId, user.id);
  if (!membership) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  if (!canOptInEmailReminders(membership.role)) {
    return NextResponse.json({ error: "Роль «только просмотр» не может включать email-напоминания" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const updated = await prisma.classMember.update({
    where: { id: membership.id },
    data: { emailRemindersOptIn: parsed.data.emailRemindersOptIn },
    select: { emailRemindersOptIn: true, role: true },
  });

  return NextResponse.json({ ok: true, membership: updated });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { id: classId } = await params;
  const membership = await getClassMembership(classId, user.id);
  if (!membership) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  return NextResponse.json({
    role: membership.role,
    emailRemindersOptIn: membership.emailRemindersOptIn,
    canOptInEmailReminders: canOptInEmailReminders(membership.role),
  });
}
