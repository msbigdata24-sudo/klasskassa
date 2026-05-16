import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { requireClassCommittee } from "@/lib/class-access";
import { GUEST_PASSWORD_HASH_PLACEHOLDER, generateGuestEmail } from "@/lib/guest-user";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const schema = z
  .object({
    email: z.string().email().max(255).optional(),
    guestName: z.string().min(1).max(80).optional(),
    role: z.enum(["PARENT", "COMMITTEE"]).optional(),
  })
  .refine((v) => Boolean(v.email) !== Boolean(v.guestName), {
    message: "Укажите либо email, либо имя гостя",
  });

export async function POST(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });

  const { id: classId } = await params;
  if (!(await requireClassCommittee(classId, user.id))) {
    return NextResponse.json({ error: "Только родительский комитет может добавлять родителей" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите email родителя или имя гостя" }, { status: 400 });
  }

  const memberRole = parsed.data.role ?? "PARENT";

  if (parsed.data.guestName) {
    const guestName = parsed.data.guestName.trim();
    const guest = await prisma.user.create({
      data: {
        email: generateGuestEmail(),
        name: guestName,
        passwordHash: GUEST_PASSWORD_HASH_PLACEHOLDER,
      },
      select: { id: true, name: true },
    });
    await prisma.classMember.create({
      data: { classId, userId: guest.id, role: memberRole },
    });
    await logActivity({
      classId,
      actorId: user.id,
      kind: "MEMBER_ADDED",
      text: `Добавлен гость: ${guest.name}`,
      metadata: { userId: guest.id, isGuest: true },
    });
    return NextResponse.json({
      ok: true,
      member: { id: guest.id, email: null, name: guest.name, isGuest: true, role: memberRole },
    });
  }

  const email = parsed.data.email!.trim().toLowerCase();
  const invited = await prisma.user.findUnique({ where: { email } });
  if (!invited) {
    return NextResponse.json(
      { error: "Пользователь с таким email не найден — пусть сначала зарегистрируется" },
      { status: 404 },
    );
  }

  const existing = await prisma.classMember.findUnique({
    where: { classId_userId: { classId, userId: invited.id } },
  });
  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyMember: true,
      member: { id: invited.id, email: invited.email, name: invited.name, role: existing.role },
    });
  }

  await prisma.classMember.create({
    data: { classId, userId: invited.id, role: memberRole },
  });
  await logActivity({
    classId,
    actorId: user.id,
    kind: "MEMBER_ADDED",
    text: `Добавлен родитель: ${invited.name}`,
    metadata: { userId: invited.id },
  });

  return NextResponse.json({
    ok: true,
    member: { id: invited.id, email: invited.email, name: invited.name, role: memberRole },
  });
}
