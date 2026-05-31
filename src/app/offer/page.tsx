import Link from "next/link";
import {
  LEGAL_DOCS_EFFECTIVE_DATE,
  LEGAL_DOCS_VERSION,
  OPERATOR,
  SERVICE_NAME,
  operatorIntroLine,
  operatorRequisitesLine,
} from "@/lib/legal-operator";

export const metadata = {
  title: `Пользовательское соглашение — ${SERVICE_NAME}`,
};

export default function OfferPage() {
  return (
    <main className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold text-stone-900">Пользовательское соглашение</h1>
      <p className="text-xs text-stone-500">
        Версия {LEGAL_DOCS_VERSION}. Действует с {LEGAL_DOCS_EFFECTIVE_DATE}.
      </p>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">1. Общие положения</h2>
        <p className="mt-2">
          Настоящее Соглашение регулирует использование сервиса «{SERVICE_NAME}» между {operatorIntroLine()} (далее —
          «Оператор») и пользователем (далее — «Пользователь»).
        </p>
        <p className="mt-2">{operatorRequisitesLine()}</p>
        <p className="mt-2">
          Регистрируясь, вы принимаете Соглашение и{" "}
          <Link href="/privacy" className="text-brand underline">
            Политику конфиденциальности
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">2. Предмет</h2>
        <p className="mt-2">
          Сервис помогает родительскому комитету и родителям школьного класса вести учёт целевых сборов: кто сдал взнос,
          кто нет, с прикреплением чеков и публичной ссылкой для чата класса.
        </p>
        <p className="mt-2 font-semibold text-stone-900">
          Сервис не является платёжной системой, банком или агентом по приёму школьных денег.
        </p>
        <p className="mt-2">
          Деньги родители переводят самостоятельно (СБП, карта, наличные). Оператор не хранит деньги класса и не
          отвечает за факт перевода.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">3. Бета-этап</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>функции могут меняться без предупреждения;</li>
          <li>возможны перебои и потеря части данных;</li>
          <li>гарантии SLA не предоставляются;</li>
          <li>инфраструктура может находиться за пределами РФ (см. Политику).</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">4. Регистрация</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>самостоятельная регистрация — с 14 лет;</li>
          <li>родком отвечает за добавление гостей (родителей без email) и за публикацию ссылки отчёта в чате;</li>
          <li>пароль храните в секрете; при компрометации — смените пароль и сообщите Оператору.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">5. Правила использования</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>не нарушать закон и права других людей;</li>
          <li>не загружать вредоносные файлы и чужие персональные данные без оснований;</li>
          <li>не пытаться получить доступ к чужим классам и отчётам;</li>
          <li>не создавать автоматическую нагрузку на Сервис.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">6. Добровольная поддержка</h2>
        <p className="mt-2">
          Сервис бесплатен на старте. Добровольные переводы через Ozon Bank на странице{" "}
          <Link href="/support" className="text-brand underline">
            /support
          </Link>{" "}
          — это поддержка разработки, не оплата школьного сбора и не подписка Pro (если появится позже).
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">7. Ответственность</h2>
        <p className="mt-2">Сервис предоставляется «как есть». Оператор не отвечает за:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>достоверность сумм и статусов, внесённых пользователями;</li>
          <li>фактические переводы между родителями и родкомом;</li>
          <li>утечку данных из-за передачи публичной ссылки третьим лицам;</li>
          <li>сбои хостинга и связи.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">8. Персональные данные</h2>
        <p className="mt-2">
          Порядок обработки — в{" "}
          <Link href="/privacy" className="text-brand underline">
            Политике конфиденциальности
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">9. Изменения</h2>
        <p className="mt-2">
          Актуальная редакция —{" "}
          <Link href="/offer" className="text-brand underline">
            /offer
          </Link>
          . Продолжение использования после обновления означает согласие.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">10. Право и споры</h2>
        <p className="mt-2">Применяется право Российской Федерации. Споры — по месту нахождения Оператора, если иное не предусмотрено законом.</p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">11. Контакты</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>email: {OPERATOR.contactEmail}</li>
          <li>Telegram: {OPERATOR.telegramBetaTitle}</li>
          <li>корреспонденция: {OPERATOR.postalAddress}</li>
        </ul>
      </section>
    </main>
  );
}
