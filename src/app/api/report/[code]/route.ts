import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPublicReportAccess, reportAccessMessage } from "@/lib/public-report";
import { checkRateLimit, clientIpFromRequest, rateLimitResponse } from "@/lib/rate-limit";
import { logServerError } from "@/lib/server-log";

type Params = { params: Promise<{ code: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ip = clientIpFromRequest(req);
    const limited = checkRateLimit(`report-api:${ip}`, 60, 60_000);
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

    const { code } = await params;
    if (!code || code.length < 8 || code.length > 64) {
      return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
    }

    const collection = await prisma.collection.findUnique({
      where: { publicReportCode: code },
      select: {
        id: true,
        title: true,
        amountCents: true,
        deadline: true,
        publicReportEnabled: true,
        publicReportExpiresAt: true,
        class: { select: { name: true } },
        contributions: {
          orderBy: { user: { name: "asc" } },
          select: {
            isPaid: true,
            paidAt: true,
            markedByParent: true,
            receiptStored: true,
            receiptDeletedAt: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
    }

    const access = checkPublicReportAccess(collection);
    if (!access.ok) {
      return NextResponse.json({ error: reportAccessMessage(access.reason) }, { status: 403 });
    }

    const paid = collection.contributions.filter(
      (c) => c.isPaid && (c.receiptStored || c.receiptDeletedAt),
    );
    const unpaid = collection.contributions.filter(
      (c) => !c.isPaid || (!c.receiptStored && !c.receiptDeletedAt),
    );

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
  } catch (error) {
    logServerError("report-api", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
