import { notFound } from "next/navigation";
import { formatRub } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ code: string }> };

export const metadata = {
  title: "Отчёт по сбору — КлассКасса",
};

export default async function PublicReportPage({ params }: Props) {
  const { code } = await params;

  const collection = await prisma.collection.findUnique({
    where: { publicReportCode: code },
    select: {
      title: true,
      amountCents: true,
      deadline: true,
      class: { select: { name: true } },
      contributions: {
        orderBy: { user: { name: "asc" } },
        select: {
          isPaid: true,
          markedByParent: true,
          paidAt: true,
          receiptUrl: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!collection) notFound();

  const paid = collection.contributions.filter((c) => c.isPaid && c.receiptUrl);
  const unpaid = collection.contributions.filter((c) => !c.isPaid || !c.receiptUrl);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">КлассКасса · отчёт</p>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">{collection.class.name}</h1>
      <p className="mt-1 text-lg text-stone-800">{collection.title}</p>
      <p className="mt-2 text-sm text-stone-600">Взнос: {formatRub(collection.amountCents)}</p>
      {collection.deadline ? (
        <p className="text-sm text-stone-500">Срок: {collection.deadline.toLocaleDateString("ru-RU")}</p>
      ) : null}

      <div className="mt-6 rounded-2xl bg-brandLight p-4 text-center">
        <p className="text-3xl font-bold text-brandDark">
          {paid.length} / {collection.contributions.length}
        </p>
        <p className="text-sm text-stone-600">родителей сдали взнос</p>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-green-800">Сдали ({paid.length})</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {paid.map((c, i) => (
            <li key={i}>
              {c.user.name}
              {c.markedByParent ? <span className="text-stone-400"> · отметил сам</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-amber-800">Не сдали ({unpaid.length})</h2>
        {unpaid.length === 0 ? (
          <p className="mt-2 text-sm text-green-700">Все сдали — спасибо!</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {unpaid.map((c, i) => (
              <li key={i}>{c.user.name}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-center text-xs text-stone-400">КлассКасса · учёт без приёма денег</p>
    </main>
  );
}
