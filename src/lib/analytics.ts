import { prisma } from "@/lib/prisma";

export async function logUserEvent(params: {
  userId: string;
  kind: string;
  text: string;
  metadata?: unknown;
  groupId?: string | null;
}) {
  await prisma.activityEvent.create({
    data: {
      actorId: params.userId,
      groupId: params.groupId ?? undefined,
      kind: params.kind,
      text: params.text,
      metadata: params.metadata ?? undefined,
    },
    select: { id: true },
  });
}

export async function logUserEventOncePerDay(params: {
  userId: string;
  kind: string;
  text: string;
  metadata?: unknown;
}) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const exists = await prisma.activityEvent.findFirst({
    where: {
      actorId: params.userId,
      kind: params.kind,
      createdAt: { gte: start },
    },
    select: { id: true },
  });
  if (exists) return;

  await logUserEvent(params);
}
