import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership, requireClassMembership } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; collectionId: string }> };

const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export async function POST(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { id: classId, collectionId } = await params;
  if (!(await requireClassMembership(classId, user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const membership = await getClassMembership(classId, user.id);
  if (!membership) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Нужен multipart/form-data" }, { status: 400 });

  const file = form.get("file");
  const targetUserId = String(form.get("userId") ?? user.id);
  const isCommittee = membership.role === "COMMITTEE";

  if (targetUserId !== user.id && !isCommittee) {
    return NextResponse.json({ error: "Чек можно прикрепить только к своему взносу" }, { status: 403 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Выберите файл чека" }, { status: 400 });
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Допустимы JPEG, PNG, WebP, GIF или PDF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл не больше 5 МБ" }, { status: 400 });
  }

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, classId },
    select: { id: true, title: true },
  });
  if (!collection) return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });

  const existingContribution = await prisma.contribution.findUnique({
    where: { collectionId_userId: { collectionId, userId: targetUserId } },
    select: { id: true },
  });
  if (!existingContribution) {
    return NextResponse.json({ error: "Взнос не найден" }, { status: 404 });
  }

  const receiptData = Buffer.from(await file.arrayBuffer());
  const receiptFileName = `${existingContribution.id}-${Date.now()}.${ext}`;
  const receiptUrl = `/api/receipts/${collectionId}/${receiptFileName}`;

  const contribution = await prisma.contribution.update({
    where: { collectionId_userId: { collectionId, userId: targetUserId } },
    data: {
      receiptUrl,
      receiptData,
      receiptMime: file.type,
      receiptFileName,
      isPaid: true,
      markedByParent: targetUserId === user.id && !isCommittee,
      markedByUserId: user.id,
      paidAt: new Date(),
    },
    select: { id: true, receiptUrl: true, receiptMime: true, isPaid: true },
  });

  await logActivity({
    classId,
    actorId: user.id,
    kind: "RECEIPT_UPLOADED",
    text: `Прикреплён чек к сбору «${collection.title}»`,
    metadata: { collectionId, contributionId: contribution.id },
  });

  return NextResponse.json({ ok: true, contribution });
}
