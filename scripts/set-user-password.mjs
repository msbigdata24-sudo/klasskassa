/**
 * Одноразовая смена пароля без SMTP (когда почта не настроена).
 *
 * В терминале (Windows PowerShell пример):
 *   $env:DATABASE_URL="postgresql://..."   # строка подключения с Render → PostgreSQL
 *   $env:TARGET_EMAIL="ваш@email.ru"
 *   $env:NEW_PASSWORD="новый_пароль_от_6_символов"
 *   npm run set-password
 *
 * Либо одной строкой в bash: DATABASE_URL=... TARGET_EMAIL=... NEW_PASSWORD=... npm run set-password
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = (process.env.TARGET_EMAIL || "").trim().toLowerCase();
const password = process.env.NEW_PASSWORD || "";

if (!email || !password) {
  console.error("Задайте переменные TARGET_EMAIL и NEW_PASSWORD (и DATABASE_URL для нужной БД).");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Пароль не короче 6 символов.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) {
    console.error(`Пользователь с email ${email} не найден.`);
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  console.log(`Пароль обновлён для ${user.email}`);
} finally {
  await prisma.$disconnect();
}
