import { prisma } from "@/lib/prisma";

export async function requireGroupMembership(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return !!member;
}

export async function getGroupMembership(groupId: string, userId: string) {
  return prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { id: true, role: true, userId: true, groupId: true },
  });
}

export async function requireGroupAdmin(groupId: string, userId: string) {
  const member = await getGroupMembership(groupId, userId);
  return !!member && member.role === "ADMIN";
}
