import { OPERATOR, LEGAL_BETA_DISCLOSURE, operatorRequisitesLine } from "@/lib/legal-operator";

export const metadata = {
  title: "Контакты — КлассКасса",
};

export default function ContactsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold text-stone-900">Контакты</h1>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">Оператор персональных данных</h2>
        <p className="mt-2">{LEGAL_BETA_DISCLOSURE}</p>
        <p className="mt-2">{operatorRequisitesLine()}</p>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">Связь</h2>
        <p className="mt-2">
          Email:{" "}
          <a href={`mailto:${OPERATOR.contactEmail}`} className="text-brandDark underline hover:text-brand">
            {OPERATOR.contactEmail}
          </a>
        </p>
        <p className="mt-1">
          Telegram:{" "}
          <a
            href={OPERATOR.telegramBetaInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brandDark underline hover:text-brand"
          >
            {OPERATOR.telegramBetaTitle}
          </a>
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Официальная корреспонденция на бета-этапе: {OPERATOR.postalAddress}
        </p>
        <p className="mt-3 text-xs text-stone-500">
          По вопросам ПДн (доступ, удаление, отзыв согласия) — тема письма «ПДн».
        </p>
      </section>
    </main>
  );
}
