import Link from "next/link";
import { SupportDonateLink, SupportEventPing } from "@/components/support-events";
import { SUPPORT_PRO_NOTE, SUPPORT_QR_IMAGE } from "@/lib/support";

export const metadata = {
  title: "Поддержать проект — КлассКасса",
  description: "Добровольная поддержка развития КлассКассы через Ozon Bank",
};

export default function SupportPage() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <SupportEventPing event="SUPPORT_PAGE_OPENED" location="support_page" />
      <SupportEventPing event="DONATE_QR_SHOWN" location="support_page" />

      <Link href="/" className="text-sm text-stone-500 hover:text-brandDark">
        ← На главную
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">Поддержать проект</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-stone-900">
          КлассКасса развивается благодаря пользователям
        </h1>
        <p className="mt-4 text-stone-600">
          Сервис бесплатен на старте. Если КлассКасса помогла вашему классу меньше спорить в чате, не терять чеки и
          быстрее понимать, кто сдал взнос, можно поддержать разработку любой суммой.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Это добровольная поддержка проекта, а не оплата школьного сбора и не покупка тарифа.
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl bg-brandLight p-5 ring-1 ring-brand/20 sm:grid-cols-[220px_1fr] sm:items-center">
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200/80">
          <img src={SUPPORT_QR_IMAGE} alt="QR-код для поддержки КлассКассы через Ozon Bank" className="w-full rounded-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">Поддержать через Ozon Bank</h2>
          <p className="mt-2 text-sm text-stone-600">
            Отсканируйте QR-код или откройте ссылку. Сумму можно выбрать уже на стороне Ozon Bank.
          </p>
          <SupportDonateLink
            location="support_page"
            className="btn-soft-3d mt-4 inline-flex min-h-12 w-full items-center justify-center px-5 py-3 text-base font-semibold sm:w-auto"
          >
            Открыть ссылку Ozon Bank
          </SupportDonateLink>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-brandDark">На что идут донаты</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>сервер и база данных;</li>
          <li>удобные отчёты для родительского комитета;</li>
          <li>будущие напоминания и архив учебного года;</li>
          <li>поддержка и развитие продукта без рекламы и лишней сложности.</li>
        </ul>
        <p className="mt-4 rounded-xl bg-brandLight p-3 text-xs text-stone-600">{SUPPORT_PRO_NOTE}</p>
      </section>
    </main>
  );
}
