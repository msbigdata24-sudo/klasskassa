import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ code: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { code } = await params;

  const collection = await prisma.collection.findUnique({
    where: { publicReportCode: code },
    select: {
      id: true,
      title: true,
      amountCents: true,
      deadline: true,
      class: { select: { name: true } },
      contributions: {
        orderBy: { user: { name: "asc" } },
        select: {
          isPaid: true,
          paidAt: true,
          markedByParent: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
  }

  const paid = collection.contributions.filter((c) => c.isPaid);
  const unpaid = collection.contributions.filter((c) => !c.isPaid);

  return NextResponse.json({
    className: collection.class.name,
    collectionTitle: collection.title,
    amountCents: collection.amountCents,
    deadline: collection.deadline,
    summary: {
      total: collection.contributions.length,
      paid: paid.length,
      unpaid: unpaid.length,
    },
    paid: paid.map((c) => ({ name: c.user.name, paidAt: c.paidAt, selfMarked: c.markedByParent })),
    unpaid: unpaid.map((c) => ({ name: c.user.name })),
  });
}
