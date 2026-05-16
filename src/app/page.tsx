import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/classes" : "/register";

  return (
    <main className="flex flex-1 flex-col gap-5">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">КлассКасса</p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">Родительские сборы — прозрачно и без таблиц</h1>
        <p className="mt-3 text-stone-600">
          Учёт взносов в школьном классе: кто сдал, кто нет, с чеками и ссылкой для WhatsApp. Деньги переводите сами —
          сервис только фиксирует статус оплаты.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={primaryHref} className="btn-soft-3d inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-sm font-semibold">
            {user ? "Мои классы" : "Создать класс бесплатно"}
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 hover:border-brand hover:text-brandDark"
          >
            Войти
          </Link>
        </div>
        <p className="mt-3 text-xs text-stone-500">Без приёма платежей через сервис. Родительский комитет и родители видят одну картину.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Сбор", text: "Целевой взнос с фиксированной суммой на каждого родителя" },
          { title: "Взнос", text: "Родитель сам отмечает оплату и прикрепляет фото чека" },
          { title: "Отчёт", text: "Публичная ссылка «кто сдал / кто нет» для чата класса" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
            <h2 className="font-semibold text-brandDark">{item.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{item.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
