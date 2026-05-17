import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ collectionId: string; fileName: string }> };

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(_req: Request, { params }: Params) {
  const { collectionId, fileName } = await params;

  if (!/^[a-z0-9_-]+$/i.test(collectionId) || !/^[a-z0-9_.-]+$/i.test(fileName)) {
    return NextResponse.json({ error: "Некорректный путь" }, { status: 400 });
  }

  const ext = path.extname(fileName).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) {
    return NextResponse.json({ error: "Формат не поддерживается" }, { status: 400 });
  }

  const apiUrl = `/api/receipts/${collectionId}/${fileName}`;
  const legacyUrl = `/uploads/receipts/${collectionId}/${fileName}`;
  const contribution = await prisma.contribution.findFirst({
    where: {
      collectionId,
      OR: [{ receiptUrl: apiUrl }, { receiptUrl: legacyUrl }, { receiptFileName: fileName }],
    },
    select: { receiptData: true, receiptMime: true },
  });

  if (contribution?.receiptData && contribution.receiptMime) {
    return new NextResponse(Buffer.from(contribution.receiptData), {
      headers: {
        "Content-Type": contribution.receiptMime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", "receipts", collectionId, fileName);

  try {
    const file = await readFile(fullPath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Чек не найден" }, { status: 404 });
  }
}
