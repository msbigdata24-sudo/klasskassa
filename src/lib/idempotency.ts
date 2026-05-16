import { prisma } from "@/lib/prisma";

export async function getDuplicateTargetId(userId: string, scope: string, idemKey: string) {
  const found = await prisma.requestDedup.findUnique({
    where: { userId_scope_idemKey: { userId, scope, idemKey } },
    select: { targetId: true },
  });
  return found?.targetId ?? null;
}

export async function saveIdemResult(userId: string, scope: string, idemKey: string, targetId?: string) {
  await prisma.requestDedup.create({
    data: { userId, scope, idemKey, targetId },
    select: { id: true },
  });
}
