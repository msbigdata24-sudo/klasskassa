import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  event: z.enum([
    "SUPPORT_PAGE_OPENED",
    "DONATE_LINK_CLICKED",
    "DONATE_QR_SHOWN",
    "DONATE_BLOCK_VIEWED_HOME",
    "DONATE_BLOCK_VIEWED_CLASS",
  ]),
  location: z.string().max(80).optional(),
  classId: z.string().max(80).optional(),
});

const eventText: Record<z.infer<typeof schema>["event"], string> = {
  SUPPORT_PAGE_OPENED: "Открыта страница поддержки",
  DONATE_LINK_CLICKED: "Клик по ссылке доната",
  DONATE_QR_SHOWN: "Показан QR доната",
  DONATE_BLOCK_VIEWED_HOME: "Показан блок поддержки на главной",
  DONATE_BLOCK_VIEWED_CLASS: "Показан блок поддержки в классе",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await prisma.activityEvent.create({
    data: {
      kind: parsed.data.event,
      text: eventText[parsed.data.event],
      metadata: {
        location: parsed.data.location ?? null,
        classId: parsed.data.classId ?? null,
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
