import { prisma } from "@/lib/prisma";

export async function touchGroup(groupId: string) {
  await prisma.group.update({
    where: { id: groupId },
    data: { updatedAt: new Date() },
    select: { id: true },
  });
}
