import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ code: string }> };

export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { code } = await params;
  const schoolClass = await prisma.schoolClass.findUnique({
    where: { inviteCode: code },
    select: { id: true, inviteActive: true, name: true },
  });
  if (!schoolClass || !schoolClass.inviteActive) {
    return NextResponse.json({ error: "Ссылка недействительна" }, { status: 404 });
  }

  const existing = await prisma.classMember.findUnique({
    where: { classId_userId: { classId: schoolClass.id, userId: user.id } },
  });

  await prisma.classMember.upsert({
    where: { classId_userId: { classId: schoolClass.id, userId: user.id } },
    create: { classId: schoolClass.id, userId: user.id, role: "PARENT" },
    update: {},
  });

  if (!existing) {
    await logActivity({
      classId: schoolClass.id,
      actorId: user.id,
      kind: "CLASS_JOINED_BY_INVITE",
      text: `${user.name} присоединился к классу «${schoolClass.name}»`,
    });
  }

  return NextResponse.json({ classId: schoolClass.id });
}
