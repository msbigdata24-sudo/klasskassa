import { NextResponse } from "next/server";
import sharp from "sharp";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership, requireClassMembership } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; collectionId: string }> };

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_BYTES = 3 * 1024 * 1024;
const COMPRESSED_IMAGE_MIME = "image/jpeg";
const COMPRESSED_IMAGE_EXT = "jpg";
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

async function prepareReceiptFile(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith("image/");

  if (isImage) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Фото чека не больше 8 МБ до сжатия");
    }
    const compressed = await sharp(input, { animated: false })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer();

    return {
      data: compressed,
      mime: COMPRESSED_IMAGE_MIME,
      ext: COMPRESSED_IMAGE_EXT,
    };
  }

  if (file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) {
      throw new Error("PDF-чек не больше 3 МБ");
    }
    return {
      data: input,
      mime: file.type,
      ext: EXT_BY_MIME[file.type],
    };
  }

  throw new Error("Допустимы JPEG, PNG, WebP, GIF или PDF");
}

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

  let prepared: Awaited<ReturnType<typeof prepareReceiptFile>>;
  try {
    prepared = await prepareReceiptFile(file);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось обработать чек";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const receiptFileName = `${existingContribution.id}-${Date.now()}.${prepared.ext}`;
  const receiptUrl = `/api/receipts/${collectionId}/${receiptFileName}`;

  const contribution = await prisma.contribution.update({
    where: { collectionId_userId: { collectionId, userId: targetUserId } },
    data: {
      receiptUrl,
      receiptData: prepared.data,
      receiptMime: prepared.mime,
      receiptFileName,
      receiptStored: true,
      receiptDeletedAt: null,
      isPaid: true,
      markedByParent: targetUserId === user.id && !isCommittee,
      markedByUserId: user.id,
      paidAt: new Date(),
    },
    select: { id: true, receiptUrl: true, receiptMime: true, receiptStored: true, isPaid: true },
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
