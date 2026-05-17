import Link from "next/link";
import { SupportEventPing } from "@/components/support-events";
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
      {/* Hero */}
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
          Учёт взносов в школьном классе: кто сдал, кто нет, с чеками и ссылкой для чата. Деньги переводите сами —
          сервис только фиксирует статус оплаты.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Без приёма платежей через сервис · для родкома и родителей · бесплатно на старте
        </p>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-lg font-bold text-stone-900">Что делать прямо сейчас</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { n: "1", title: "Создайте класс", text: "5А, 8В — вы в родительском комитете" },
            { n: "2", title: "Объявите сбор", text: "Сумма с каждого родителя, одна кнопка" },
            { n: "3", title: "Киньте ссылку в чат", text: "Родители видят, кто сдал и кто нет" },
          ].map((step) => (
            <li
              key={step.n}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-2 font-semibold text-brandDark">{step.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Report demo */}
      <section className="rounded-2xl bg-gradient-to-br from-brandLight to-white p-6 ring-1 ring-brand/20">
        <h2 className="text-lg font-bold text-stone-900">Так выглядит отчёт для чата</h2>
        <p className="mt-1 text-sm text-stone-600">
          Одна ссылка без входа — родители видят честную картину, без «а кто уже перевёл?»
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
            <p className="text-xs font-medium uppercase text-brand">Сдали</p>
            <ul className="mt-2 space-y-1 text-sm text-stone-800">
              <li className="flex justify-between">
                <span>Иванова М.</span>
                <span className="text-green-700">✓</span>
              </li>
              <li className="flex justify-between">
                <span>Петров А.</span>
                <span className="text-green-700">✓</span>
              </li>
              <li className="flex justify-between">
                <span>Сидорова Е.</span>
                <span className="text-green-700">✓</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
            <p className="text-xs font-medium uppercase text-amber-700">Не сдали</p>
            <ul className="mt-2 space-y-1 text-sm text-stone-800">
              <li>Козлов Д.</li>
              <li>Новикова И.</li>
            </ul>
            <p className="mt-3 text-center text-2xl font-bold text-brandDark">3 / 5</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/report/demo"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brandDark ring-1 ring-brand/40 hover:bg-brandLight"
          >
            Открыть пример отчёта →
          </Link>
          <p className="self-center text-xs text-stone-500 sm:text-sm">
            В вашем классе ссылка будет своя и обновляется сама
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="rounded-2xl border-l-4 border-brand bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <p className="text-base italic leading-relaxed text-stone-700">
          «Организовали выпускной за 3 дня без 500 сообщений в чате. Родители сами отмечают оплату — это гениально.»
        </p>
        <p className="mt-3 text-sm font-medium text-brandDark">— Мария, родком 9«А»</p>
      </section>

      {/* Support */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <SupportEventPing event="DONATE_BLOCK_VIEWED_HOME" location="home" />
        <p className="text-sm font-medium uppercase tracking-wide text-brand">Поддержать проект</p>
        <h2 className="mt-2 text-xl font-bold text-stone-900">КлассКасса бесплатна на старте</h2>
        <p className="mt-2 text-sm text-stone-600">
          Если сервис помог вашему классу убрать хаос из чата и таблиц, поддержите разработку любой суммой через Ozon
          Bank. Это добровольная поддержка, не оплата школьного сбора.
        </p>
        <Link
          href="/support"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-brand/30 px-5 py-2.5 text-sm font-semibold text-brandDark hover:border-brand hover:bg-brandLight"
        >
          Поддержать КлассКассу
        </Link>
      </section>

      {/* Features */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Сбор", text: "Целевой взнос с фиксированной суммой на каждого родителя" },
          { title: "Взнос", text: "Родитель сам отмечает оплату и прикрепляет фото чека" },
          { title: "Отчёт", text: "Публичная ссылка «кто сдал / кто не сдал» для чата класса" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
            <h2 className="font-semibold text-brandDark">{item.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{item.text}</p>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl bg-brandDark p-6 text-center text-white sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">Готовы убрать хаос из чата класса?</h2>
        <p className="mt-2 text-sm text-blue-100">Создайте класс за минуту — первый сбор и отчёт сразу под рукой.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={createHref}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-brandDark shadow-lg transition hover:bg-brandLight sm:w-auto"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/report/demo"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
          >
            Сначала посмотреть отчёт
          </Link>
        </div>
      </section>
    </main>
  );
}
