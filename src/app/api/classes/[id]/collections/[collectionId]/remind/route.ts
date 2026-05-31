import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { getClassMembership, requireClassCommittee } from "@/lib/class-access";
import { isGuestEmail } from "@/lib/guest-user";
import { getAppBaseUrl, getSmtpConfig } from "@/lib/env";
import { sendCollectionReminderEmail } from "@/lib/mail";
import { buildCollectionReminderMessage } from "@/lib/reminders";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/server-log";

type Params = { params: Promise<{ id: string; collectionId: string }> };

const bodySchema = z.object({
  sendEmail: z.boolean().optional(),
});

function isContributionPaid(c: {
  isPaid: boolean;
  receiptStored: boolean;
  receiptDeletedAt: Date | null;
}) {
  return c.isPaid && (c.receiptStored || !!c.receiptDeletedAt);
}

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

    const { id: classId, collectionId } = await params;
    if (!(await requireClassCommittee(classId, user.id))) {
      return NextResponse.json({ error: "Напоминания отправляет родком" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    const sendEmail = parsed.success ? parsed.data.sendEmail === true : false;

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, classId },
      select: {
        id: true,
        title: true,
        amountCents: true,
        deadline: true,
        publicReportCode: true,
        class: { select: { name: true } },
        contributions: {
          select: {
            userId: true,
            isPaid: true,
            receiptStored: true,
            receiptDeletedAt: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!collection) return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });

    const unpaid = collection.contributions.filter((c) => !isContributionPaid(c));
    const reportUrl = `${getAppBaseUrl()}/report/${collection.publicReportCode}`;
    const chatMessage = buildCollectionReminderMessage({
      className: collection.class.name,
      collectionTitle: collection.title,
      amountCents: collection.amountCents,
      unpaid: unpaid.map((c) => ({ name: c.user.name })),
      reportUrl,
      deadline: collection.deadline,
    });

    let emailsSent = 0;
    let emailsSkipped = 0;

    if (sendEmail && getSmtpConfig()) {
      const members = await prisma.classMember.findMany({
        where: { classId },
        select: { userId: true, emailRemindersOptIn: true, user: { select: { email: true, name: true } } },
      });
      const memberByUserId = new Map(members.map((m) => [m.userId, m]));

      for (const c of unpaid) {
        const member = memberByUserId.get(c.userId);
        const email = c.user.email;
        if (!member?.emailRemindersOptIn || isGuestEmail(email)) {
          emailsSkipped += 1;
          continue;
        }
        const result = await sendCollectionReminderEmail(email, {
          parentName: c.user.name,
          className: collection.class.name,
          collectionTitle: collection.title,
          amountCents: collection.amountCents,
          reportUrl,
        });
        if (result.ok) emailsSent += 1;
        else emailsSkipped += 1;
      }
    } else if (sendEmail) {
      emailsSkipped = unpaid.length;
    }

    await prisma.collection.update({
      where: { id: collectionId },
      data: { lastReminderAt: new Date() },
    });

    await logActivity({
      classId,
      actorId: user.id,
      kind: "COLLECTION_REMINDER",
      text: `Напоминание по сбору «${collection.title}» (${unpaid.length} не сдали)`,
      metadata: { collectionId, emailsSent, sendEmail },
    });

    return NextResponse.json({
      ok: true,
      chatMessage,
      unpaidCount: unpaid.length,
      emailsSent,
      emailsSkipped,
      smtpConfigured: !!getSmtpConfig(),
    });
  } catch (error) {
    logServerError("collection-remind", error);
    return NextResponse.json({ error: "Не удалось подготовить напоминание" }, { status: 500 });
  }
}
