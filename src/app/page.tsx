import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

function PrimaryCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="btn-soft-3d inline-flex min-h-12 w-full items-center justify-center px-6 py-3 text-base font-semibold sm:w-auto"
    >
      {label}
    </Link>
  );
}

function SecondaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-brand/30 bg-white px-6 py-3 text-base font-semibold text-brandDark transition hover:border-brand hover:bg-brandLight sm:w-auto"
    >
      {children}
    </Link>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const createHref = user ? "/classes/new" : "/register?next=/classes/new";
  const primaryLabel = user ? "Создать класс →" : "Зарегистрироваться бесплатно";
  const loginHref = user ? "/classes" : "/login";

  return (
    <main className="flex flex-1 flex-col gap-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">КлассКасса</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          Родительские сборы — прозрачно и без таблиц
        </h1>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <PrimaryCta href={createHref} label={primaryLabel} />
          <SecondaryCta href={loginHref}>{user ? "Мои классы" : "Уже есть аккаунт — войти"}</SecondaryCta>
        </div>

        <p className="mt-4 text-stone-600">
          Кто сдал, кто нет — с чеками и ссылкой для чата. Деньги переводите сами, сервис только фиксирует статус.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-stone-900">Три шага</h2>
        <ol className="mt-3 grid list-none gap-3 sm:grid-cols-3">
          {[
            { n: "1", title: "Создайте класс", text: "5А, 8В — вы в родкоме" },
            { n: "2", title: "Объявите сбор", text: "Сумма с каждого родителя" },
            { n: "3", title: "Ссылка в чат", text: "Родители видят, кто сдал" },
          ].map((step) => (
            <li key={step.n} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
                aria-hidden
              >
                {step.n}
              </span>
              <h3 className="mt-2 font-semibold text-brandDark">{step.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-brandLight to-white p-6 ring-1 ring-brand/20">
        <h2 className="text-lg font-bold text-stone-900">Пример отчёта для чата</h2>
        <p className="mt-1 text-sm text-stone-600">Одна ссылка без входа — видно, кто уже перевёл.</p>
        <Link
          href="/report/demo"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brandDark ring-1 ring-brand/40 hover:bg-brandLight"
        >
          Открыть пример →
        </Link>
      </section>

      <section className="rounded-2xl bg-brandDark p-6 text-center text-white sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">Готовы убрать хаос из чата?</h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={createHref}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-brandDark shadow-lg transition hover:bg-brandLight sm:w-auto"
          >
            {primaryLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
