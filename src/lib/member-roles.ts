import type { ClassMemberRole } from "@prisma/client";

export const MEMBER_ROLE_LABELS: Record<ClassMemberRole, string> = {
  COMMITTEE: "родком",
  PARENT: "родитель",
  VIEWER: "только просмотр",
};

export function canManageClass(role: ClassMemberRole) {
  return role === "COMMITTEE";
}

export function canUploadOwnReceipt(role: ClassMemberRole) {
  return role === "PARENT" || role === "COMMITTEE";
}

export function canMarkOthers(role: ClassMemberRole) {
  return role === "COMMITTEE";
}

export function canChangeMemberRoles(role: ClassMemberRole) {
  return role === "COMMITTEE";
}

export function canOptInEmailReminders(role: ClassMemberRole) {
  return role === "PARENT" || role === "COMMITTEE";
}
