import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { requireClassCommittee } from "@/lib/class-access";
import { MEMBER_ROLE_LABELS } from "@/lib/member-roles";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; userId: string }> };

const patchSchema = z.object({
  role: z.enum(["PARENT", "VIEWER", "COMMITTEE"]),
});

export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { id: classId, userId: targetUserId } = await params;
  if (!(await requireClassCommittee(classId, user.id))) {
    return NextResponse.json({ error: "Роль меняет только родком" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите роль: PARENT, VIEWER или COMMITTEE" }, { status: 400 });
  }

  const member = await prisma.classMember.findUnique({
    where: { classId_userId: { classId, userId: targetUserId } },
    include: { user: { select: { name: true } } },
  });
  if (!member) return NextResponse.json({ error: "Участник не найден" }, { status: 404 });

  if (member.userId === user.id && parsed.data.role !== "COMMITTEE") {
    return NextResponse.json({ error: "Нельзя снять с себя роль родкома" }, { status: 400 });
  }

  const committeeCount = await prisma.classMember.count({
    where: { classId, role: "COMMITTEE" },
  });
  if (member.role === "COMMITTEE" && parsed.data.role !== "COMMITTEE" && committeeCount <= 1) {
    return NextResponse.json({ error: "В классе должен остаться хотя бы один родком" }, { status: 400 });
  }

  const updated = await prisma.classMember.update({
    where: { id: member.id },
    data: {
      role: parsed.data.role,
      emailRemindersOptIn: parsed.data.role === "VIEWER" ? false : member.emailRemindersOptIn,
    },
    select: { role: true, userId: true },
  });

  await logActivity({
    classId,
    actorId: user.id,
    kind: "MEMBER_ROLE_CHANGED",
    text: `${member.user.name}: роль → ${MEMBER_ROLE_LABELS[parsed.data.role]}`,
    metadata: { targetUserId, role: parsed.data.role },
  });

  return NextResponse.json({ ok: true, member: updated });
}
