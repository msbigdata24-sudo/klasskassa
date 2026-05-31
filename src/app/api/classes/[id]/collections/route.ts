import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { requireClassCommittee, requireClassMembership } from "@/lib/class-access";
import { parseRubToCents } from "@/lib/money";
import { defaultReportExpiresAt } from "@/lib/public-report";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  amountRub: z.union([z.string(), z.number()]),
  deadline: z.string().datetime().optional().nullable(),
});

export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  const { id: classId } = await params;
  if (!(await requireClassMembership(classId, user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const collections = await prisma.collection.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      amountCents: true,
      deadline: true,
      createdAt: true,
      publicReportCode: true,
      _count: { select: { contributions: true } },
      contributions: { select: { isPaid: true } },
    },
  });

  const mapped = collections.map((c) => {
    const paid = c.contributions.filter((x) => x.isPaid).length;
    return {
      id: c.id,
      title: c.title,
      amountCents: c.amountCents,
      deadline: c.deadline,
      createdAt: c.createdAt,
      publicReportCode: c.publicReportCode,
      totalParents: c._count.contributions,
      paidCount: paid,
    };
  });

  return NextResponse.json({ collections: mapped });
}

export async function POST(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  const { id: classId } = await params;
  if (!(await requireClassCommittee(classId, user.id))) {
    return NextResponse.json({ error: "Сборы создаёт родительский комитет" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте название и сумму сбора" }, { status: 400 });
  }

  const amountCents =
    typeof parsed.data.amountRub === "number"
      ? Math.round(parsed.data.amountRub * 100)
      : parseRubToCents(String(parsed.data.amountRub));
  if (amountCents === null || amountCents <= 0) {
    return NextResponse.json({ error: "Укажите корректную сумму взноса" }, { status: 400 });
  }

  const members = await prisma.classMember.findMany({
    where: { classId },
    select: { userId: true },
  });
  if (members.length === 0) {
    return NextResponse.json({ error: "В классе нет родителей" }, { status: 400 });
  }

  const collection = await prisma.collection.create({
    data: {
      classId,
      title: parsed.data.title.trim(),
      description: (parsed.data.description ?? "").trim(),
      amountCents,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      createdById: user.id,
      publicReportExpiresAt: defaultReportExpiresAt(),
      contributions: {
        create: members.map((m) => ({ userId: m.userId })),
      },
    },
    select: { id: true, title: true, publicReportCode: true },
  });

  await logActivity({
    classId,
    actorId: user.id,
    kind: "COLLECTION_CREATED",
    text: `Создан сбор «${collection.title}»`,
    metadata: { collectionId: collection.id },
  });

  return NextResponse.json({ collection });
}
