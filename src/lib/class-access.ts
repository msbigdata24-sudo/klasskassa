import type { ClassMemberRole } from "@prisma/client";
import { canManageClass, canUploadOwnReceipt } from "@/lib/member-roles";
import { prisma } from "@/lib/prisma";

export async function requireClassMembership(classId: string, userId: string) {
  const member = await prisma.classMember.findUnique({
    where: { classId_userId: { classId, userId } },
  });
  return !!member;
}

export async function getClassMembership(classId: string, userId: string) {
  return prisma.classMember.findUnique({
    where: { classId_userId: { classId, userId } },
    select: {
      id: true,
      role: true,
      userId: true,
      classId: true,
      emailRemindersOptIn: true,
    },
  });
}

export async function requireClassCommittee(classId: string, userId: string) {
  const member = await getClassMembership(classId, userId);
  return !!member && canManageClass(member.role);
}

export function isCommitteeRole(role: ClassMemberRole) {
  return canManageClass(role);
}

export function canEditContributions(role: ClassMemberRole, targetUserId: string, actorUserId: string) {
  if (role === "VIEWER") return false;
  if (canManageClass(role)) return true;
  return canUploadOwnReceipt(role) && targetUserId === actorUserId;
}
