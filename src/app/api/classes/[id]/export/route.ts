import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireClassMembership } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  const { id: classId } = await params;
  if (!(await requireClassMembership(classId, user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get("collectionId");
  if (!collectionId) {
    return NextResponse.json({ error: "Укажите collectionId" }, { status: 400 });
  }

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, classId },
    include: {
      contributions: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      },
    },
  });
  if (!collection) return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });

  const lines = [
    ["Родитель", "Email", "Сумма взноса", "Статус оплаты", "Дата оплаты", "Сам отметил", "Чек URL", "Комментарий"]
      .map(csvCell)
      .join(","),
    ...collection.contributions.map((c) =>
      [
        c.user.name,
        c.user.email.includes("@klasskassa.guest") ? "" : c.user.email,
        (collection.amountCents / 100).toFixed(2),
        c.isPaid ? "Оплачено" : "Не оплачено",
        c.paidAt?.toISOString() ?? "",
        c.markedByParent ? "да" : "нет",
        c.receiptUrl ?? "",
        c.comment,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="klasskassa-${collectionId}.csv"`,
    },
  });
}
