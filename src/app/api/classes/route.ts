import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const classes = await prisma.schoolClass.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { members: true, collections: true } },
    },
  });

  return NextResponse.json({ classes });
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите название класса" }, { status: 400 });
  }

  const schoolClass = await prisma.schoolClass.create({
    data: {
      name: parsed.data.name.trim(),
      members: { create: { userId: user.id, role: "COMMITTEE" } },
    },
    select: { id: true, name: true, inviteCode: true },
  });

  await logActivity({
    classId: schoolClass.id,
    actorId: user.id,
    kind: "CLASS_CREATED",
    text: `Создан класс «${schoolClass.name}»`,
  });

  return NextResponse.json({ class: schoolClass });
}
