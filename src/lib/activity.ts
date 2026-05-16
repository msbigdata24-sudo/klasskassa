import { prisma } from "@/lib/prisma";

export async function logActivity(params: {
  classId?: string;
  actorId?: string;
  kind: string;
  text: string;
  metadata?: unknown;
}) {
  await prisma.activityEvent.create({
    data: {
      classId: params.classId,
      actorId: params.actorId,
      kind: params.kind,
      text: params.text,
      metadata: params.metadata ?? undefined,
    },
    select: { id: true },
  });
}
