import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

export async function getCurrentUser() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;
  const v = await verifySessionToken(token);
  if (!v) return null;
  const user = await prisma.user.findUnique({
    where: { id: v.userId },
    select: { id: true, email: true, name: true },
  });
  return user;
}
