import type { ClassMemberRole } from "@prisma/client";
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
    select: { id: true, role: true, userId: true, classId: true },
  });
}

export async function requireClassCommittee(classId: string, userId: string) {
  const member = await getClassMembership(classId, userId);
  return !!member && member.role === "COMMITTEE";
}

export function isCommitteeRole(role: ClassMemberRole) {
  return role === "COMMITTEE";
}
