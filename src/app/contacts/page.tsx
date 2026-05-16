import { OPERATOR, operatorIntroLine } from "@/lib/legal-operator";

export const metadata = {
  title: "Контакты — Апельсин",
};

export default function ContactsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold text-stone-900">Контакты</h1>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">Оператор персональных данных</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{operatorIntroLine()}</li>
          <li>почтовый адрес: {OPERATOR.postalAddress}</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-peel">Связь</h2>
        <p className="mt-2">
          Email:{" "}
          <a href={`mailto:${OPERATOR.contactEmail}`} className="text-rind underline hover:text-peel">
            {OPERATOR.contactEmail}
          </a>
        </p>
        <p className="mt-1">
          Telegram (бета-тест):{" "}
          <a
            href={OPERATOR.telegramBetaInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rind underline hover:text-peel"
          >
            {OPERATOR.telegramBetaTitle}
          </a>
        </p>
        <p className="mt-3 text-xs text-stone-500">
          По вопросам, связанным с обработкой персональных данных (доступ к данным, удаление, отзыв согласия),
          указывайте в письме тему «ПДн».
        </p>
      </section>
    </main>
  );
}
