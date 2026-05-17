import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireClassMembership } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function csvRow(values: (string | number | null | undefined)[]) {
  return values.map(csvCell).join(";");
}

function safeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 40);
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
      class: { select: { name: true } },
      contributions: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      },
    },
  });
  if (!collection) return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });

  const exportDate = new Date().toISOString().slice(0, 10);
  const filename = ["КлассКасса", safeFilenamePart(collection.class.name), safeFilenamePart(collection.title), exportDate]
    .filter(Boolean)
    .join(" - ");

  const lines = [
    "sep=;",
    csvRow(["Класс", collection.class.name]),
    csvRow(["Сбор", collection.title]),
    csvRow(["Дата выгрузки", exportDate]),
    csvRow([]),
    csvRow(["Родитель", "Email", "Сумма взноса", "Статус оплаты", "Дата оплаты", "Кто отметил", "Чек URL", "Комментарий"]),
    ...collection.contributions.map((c) =>
      csvRow([
        c.user.name,
        c.user.email.includes("@klasskassa.guest") ? "" : c.user.email,
        (collection.amountCents / 100).toFixed(2),
        c.isPaid && c.receiptUrl ? "Оплачено, чек есть" : c.isPaid ? "Нет чека" : "Не оплачено",
        c.paidAt?.toISOString() ?? "",
        c.markedByParent ? "родитель" : c.isPaid ? "родком" : "",
        c.receiptUrl ?? "",
        c.comment,
      ]),
    ),
  ];

  return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="klasskassa-export.csv"; filename*=UTF-8''${encodeURIComponent(
        `${filename}.csv`,
      )}`,
    },
  });
}
