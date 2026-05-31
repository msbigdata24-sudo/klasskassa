import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { requireClassCommittee } from "@/lib/class-access";
import { defaultReportExpiresAt } from "@/lib/public-report";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/server-log";

type Params = { params: Promise<{ id: string; collectionId: string }> };

const bodySchema = z.object({
  action: z.enum(["rotate", "disable", "enable", "extend"]),
});

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

    const { id: classId, collectionId } = await params;
    if (!(await requireClassCommittee(classId, user.id))) {
      return NextResponse.json({ error: "Только родком может управлять ссылкой отчёта" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Неверное действие" }, { status: 400 });
    }

    const existing = await prisma.collection.findFirst({
      where: { id: collectionId, classId },
      select: { id: true, title: true, publicReportCode: true },
    });
    if (!existing) return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });

    const { action } = parsed.data;
    let data: {
      publicReportEnabled?: boolean;
      publicReportExpiresAt?: Date;
      publicReportCode?: string;
    } = {};

    switch (action) {
      case "rotate":
        data = {
          publicReportCode: randomBytes(20).toString("hex"),
          publicReportEnabled: true,
          publicReportExpiresAt: defaultReportExpiresAt(),
        };
        break;
      case "disable":
        data = { publicReportEnabled: false };
        break;
      case "enable":
        data = {
          publicReportEnabled: true,
          publicReportExpiresAt: defaultReportExpiresAt(),
        };
        break;
      case "extend":
        data = { publicReportExpiresAt: defaultReportExpiresAt() };
        break;
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data,
      select: {
        publicReportCode: true,
        publicReportEnabled: true,
        publicReportExpiresAt: true,
      },
    });

    await logActivity({
      classId,
      actorId: user.id,
      kind: "REPORT_LINK_UPDATED",
      text: `Обновлена публичная ссылка отчёта («${existing.title}»: ${action})`,
      metadata: { collectionId, action },
    });

    return NextResponse.json({ ok: true, collection });
  } catch (error) {
    logServerError("report-link", error);
    return NextResponse.json({ error: "Не удалось обновить ссылку" }, { status: 500 });
  }
}
