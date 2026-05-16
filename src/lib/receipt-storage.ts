import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export async function saveReceiptFile(file: File, collectionId: string, userId: string): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Допустимы JPEG, PNG, WebP, GIF или PDF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл не больше 5 МБ");
  }

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "pdf";

  const dir = path.join(process.cwd(), "public", "uploads", "receipts", collectionId);
  await mkdir(dir, { recursive: true });
  const name = `${userId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const fullPath = path.join(dir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);
  return `/uploads/receipts/${collectionId}/${name}`;
}
