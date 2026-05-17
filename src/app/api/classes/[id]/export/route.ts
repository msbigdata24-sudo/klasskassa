import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireClassMembership } from "@/lib/class-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function safeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

function htmlCell(value: string | number | null | undefined, tag: "td" | "th" = "td") {
  const text = String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return `<${tag}>${text}</${tag}>`;
}

function htmlRow(values: (string | number | null | undefined)[], tag: "td" | "th" = "td") {
  return `<tr>${values.map((value) => htmlCell(value, tag)).join("")}</tr>`;
}

function publicOrigin(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host") || "";
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");

  if (host && !host.includes("localhost") && !host.startsWith("127.0.0.1")) {
    return `${proto}://${host}`;
  }

  const configured = process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_BASE_URL?.trim();
  if (configured && !configured.includes("localhost")) return configured.replace(/\/+$/, "");

  return "https://klasskassa.onrender.com";
}

function receiptExportUrl(req: Request, url: string | null) {
  if (!url) return "";
  const normalized = url.replace(/^\/uploads\/receipts\//, "/api/receipts/");
  return new URL(normalized, publicOrigin(req)).toString();
}

export async function GET(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  const { id: classId } = await params;
  if (!(await requireClassMembership(classId, user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get("collectionId");
  if (!collectionId) {
    return NextResponse.json({ error: "Укажите collectionId" }, { status: 400 });
  }

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, classId },
    include: {
      class: { select: { name: true } },
      contributions: {
        select: {
          user: { select: { name: true, email: true } },
          isPaid: true,
          markedByParent: true,
          paidAt: true,
          receiptUrl: true,
          receiptMime: true,
          receiptStored: true,
          receiptDeletedAt: true,
          comment: true,
        },
        orderBy: { user: { name: "asc" } },
      },
    },
  });
  if (!collection) return NextResponse.json({ error: "Сбор не найден" }, { status: 404 });

  const exportDate = new Date().toISOString().slice(0, 10);
  const filename = ["КлассКасса", safeFilenamePart(collection.class.name), safeFilenamePart(collection.title), exportDate]
    .filter(Boolean)
    .join(" - ");

  const rows = [
    htmlRow(["Класс", collection.class.name]),
    htmlRow(["Сбор", collection.title]),
    htmlRow(["Дата выгрузки", exportDate]),
    htmlRow([""]),
    htmlRow(["Родитель", "Email", "Сумма взноса", "Статус оплаты", "Дата оплаты", "Кто отметил", "Чек URL", "Комментарий"], "th"),
    ...collection.contributions.map((c) =>
      htmlRow([
        c.user.name,
        c.user.email.includes("@klasskassa.guest") ? "" : c.user.email,
        (collection.amountCents / 100).toFixed(2),
        c.isPaid && c.receiptStored
          ? "Оплачено, чек есть"
          : c.isPaid && c.receiptDeletedAt
            ? "Оплачено, чек удалён по сроку хранения"
            : c.isPaid
              ? "Чек нужно загрузить заново"
              : "Не оплачено",
        c.paidAt?.toISOString() ?? "",
        c.markedByParent ? "родитель" : c.isPaid ? "родком" : "",
        c.receiptStored ? receiptExportUrl(req, c.receiptUrl) : "",
        c.comment,
      ]),
    ),
  ];

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
    td, th { border: 1px solid #d9d9d9; padding: 6px 8px; vertical-align: top; }
    th { background: #e3f2fd; font-weight: bold; }
  </style>
</head>
<body>
  <table>${rows.join("\n")}</table>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="klasskassa-export.xls"; filename*=UTF-8''${encodeURIComponent(
        `${filename}.xls`,
      )}`,
    },
  });
}
