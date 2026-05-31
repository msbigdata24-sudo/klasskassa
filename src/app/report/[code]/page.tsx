import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CollectionProgressBar } from "@/components/collection-ui";
import { ReportRoster } from "@/components/report-roster";
import { formatRub } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { checkPublicReportAccess, reportAccessMessage } from "@/lib/public-report";
import { checkRateLimit } from "@/lib/rate-limit";

type Props = { params: Promise<{ code: string }> };

export const metadata = {
  title: "Отчёт по сбору — КлассКасса",
};

export default async function PublicReportPage({ params }: Props) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip")?.trim() ||
    "unknown";
  const limited = checkRateLimit(`report-page:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-xl font-bold text-stone-900">Слишком много запросов</h1>
        <p className="mt-2 text-sm text-stone-600">Подождите минуту и обновите страницу.</p>
      </main>
    );
  }

  const { code } = await params;
  if (!code || code.length < 8 || code.length > 64) notFound();

  const collection = await prisma.collection.findUnique({
    where: { publicReportCode: code },
    select: {
      title: true,
      amountCents: true,
      deadline: true,
      publicReportEnabled: true,
      publicReportExpiresAt: true,
      class: { select: { name: true } },
      contributions: {
        orderBy: { user: { name: "asc" } },
        select: {
          isPaid: true,
          markedByParent: true,
          receiptStored: true,
          receiptDeletedAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!collection) notFound();

  const access = checkPublicReportAccess(collection);
  if (!access.ok) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-xl font-bold text-stone-900">Отчёт недоступен</h1>
        <p className="mt-2 text-sm text-stone-600">{reportAccessMessage(access.reason)}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-brand underline">
          На главную
        </Link>
      </main>
    );
  }

  const paid = collection.contributions.filter((c) => c.isPaid && (c.receiptStored || c.receiptDeletedAt));
  const unpaid = collection.contributions.filter((c) => !c.isPaid || (!c.receiptStored && !c.receiptDeletedAt));

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">КлассКасса · отчёт</p>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">{collection.class.name}</h1>
      <p className="mt-1 text-lg text-stone-800">{collection.title}</p>
      <p className="mt-2 text-sm text-stone-600">Взнос: {formatRub(collection.amountCents)}</p>
      {collection.deadline ? (
        <p className="text-sm text-stone-500">Срок: {collection.deadline.toLocaleDateString("ru-RU")}</p>
      ) : null}

      <div className="mt-6 rounded-2xl bg-brandLight p-4">
        <p className="text-center text-3xl font-bold text-brandDark">
          {paid.length} / {collection.contributions.length}
        </p>
        <p className="text-center text-sm text-stone-600">родителей сдали взнос</p>
        <CollectionProgressBar paid={paid.length} total={collection.contributions.length} />
      </div>

      <ReportRoster
        paid={paid.map((c) => ({
          name: c.user.name,
          note: c.markedByParent ? "отметил сам" : null,
        }))}
        unpaid={unpaid.map((c) => ({ name: c.user.name }))}
      />

      <p className="mt-8 text-center text-xs text-stone-400">
        КлассКасса · учёт без приёма денег · ссылку видят все, у кого она есть
      </p>
    </main>
  );
}
