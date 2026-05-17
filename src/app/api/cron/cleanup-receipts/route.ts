import { NextResponse } from "next/server";
import { receiptRetentionCutoff } from "@/lib/receipts";
import { prisma } from "@/lib/prisma";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const cutoff = receiptRetentionCutoff();
  const result = await prisma.contribution.updateMany({
    where: {
      receiptStored: true,
      receiptData: { not: null },
      paidAt: { lt: cutoff },
    },
    data: {
      receiptData: null,
      receiptStored: false,
      receiptDeletedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, deletedReceipts: result.count, cutoff });
}

export async function GET(req: Request) {
  return POST(req);
}
