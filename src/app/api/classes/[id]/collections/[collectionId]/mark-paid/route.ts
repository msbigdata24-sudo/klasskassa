import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership, requireClassMembership } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; collectionId: string }> };

const schema = z.object({
  userId: z.string().optional(),
  comment: z.string().max(500).optional(),
  isPaid: z.boolean().optional(),
});

export async function POST(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { id: classId, collectionId } = await params;
  if (!(await requireClassMembership(classId, user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const membership = await getClassMembership(classId, user.id);
  if (!membership) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const targetUserId = parsed.data.userId ?? user.id;
  const isCommittee = membership.role === "COMMITTEE";

  if (targetUserId !== user.id && !isCommittee) {
    return NextResponse.json({ error: "Нельзя отмечать взнос за другого родителя" }, { status: 403 });
  }

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, classId },
    select: { id: true, title: true },
  });
  if (!collection) {
    return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });
  }

  const contribution = await prisma.contribution.findUnique({
    where: { collectionId_userId: { collectionId, userId: targetUserId } },
  });
  if (!contribution) {
    return NextResponse.json({ error: "Взнос не найден" }, { status: 404 });
  }

  const markPaid = parsed.data.isPaid !== false;
  const markedByParent = markPaid && targetUserId === user.id && !isCommittee;

  const updated = await prisma.contribution.update({
    where: { id: contribution.id },
    data: {
      isPaid: markPaid,
      markedByParent,
      markedByUserId: markPaid ? user.id : null,
      paidAt: markPaid ? new Date() : null,
      comment: parsed.data.comment?.trim() ?? contribution.comment,
      ...(markPaid ? {} : { receiptUrl: null }),
    },
    select: {
      id: true,
      isPaid: true,
      markedByParent: true,
      paidAt: true,
      receiptUrl: true,
    },
  });

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { name: true },
  });

  await logActivity({
    classId,
    actorId: user.id,
    kind: markPaid ? "CONTRIBUTION_PAID" : "CONTRIBUTION_UNPAID",
    text: markPaid
      ? `Отмечен взнос: ${targetUser?.name ?? "родитель"} — «${collection.title}»`
      : `Снята отметка взноса: ${targetUser?.name ?? "родитель"}`,
    metadata: { collectionId, contributionId: contribution.id, targetUserId },
  });

  return NextResponse.json({ ok: true, contribution: updated });
}
