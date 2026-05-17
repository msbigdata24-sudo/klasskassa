import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMetricsAdminEmail, isMetricsAdminEmail } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const supportKinds = [
  "SUPPORT_PAGE_OPENED",
  "DONATE_LINK_CLICKED",
  "DONATE_QR_SHOWN",
  "DONATE_BLOCK_VIEWED_HOME",
  "DONATE_BLOCK_VIEWED_CLASS",
] as const;

const supportLabels: Record<(typeof supportKinds)[number], string> = {
  SUPPORT_PAGE_OPENED: "Открыли страницу поддержки",
  DONATE_LINK_CLICKED: "Кликнули Ozon-ссылку",
  DONATE_QR_SHOWN: "Увидели QR-код",
  DONATE_BLOCK_VIEWED_HOME: "Увидели блок на главной",
  DONATE_BLOCK_VIEWED_CLASS: "Увидели блок в классе",
};

function fmtDate(date: Date) {
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function metricFromGroups(groups: { kind: string; _count: { _all: number } }[], kind: string) {
  return groups.find((g) => g.kind === kind)?._count._all ?? 0;
}

function asMetadata(value: unknown): { location?: unknown; classId?: unknown } {
  return value && typeof value === "object" ? (value as { location?: unknown; classId?: unknown }) : {};
}

function metadataString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function locationLabel(location: string | null) {
  switch (location) {
    case "home":
      return "главная";
    case "class_detail":
      return "страница класса";
    case "support_page":
      return "страница поддержки";
    default:
      return location;
  }
}

export const metadata = {
  title: "Метрики — КлассКасса",
};

export default async function AdminMetricsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/admin/metrics")}`);

  if (!isMetricsAdminEmail(user.email)) {
    notFound();
  }

  const adminEmail = getMetricsAdminEmail();
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [allGroups, weekGroups, monthGroups, totals, recentEvents] = await Promise.all([
    prisma.activityEvent.groupBy({
      by: ["kind"],
      where: { kind: { in: [...supportKinds] } },
      _count: { _all: true },
    }),
    prisma.activityEvent.groupBy({
      by: ["kind"],
      where: { kind: { in: [...supportKinds] }, createdAt: { gte: sevenDaysAgo } },
      _count: { _all: true },
    }),
    prisma.activityEvent.groupBy({
      by: ["kind"],
      where: { kind: { in: [...supportKinds] }, createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.schoolClass.count(),
      prisma.collection.count(),
      prisma.contribution.count({ where: { isPaid: true } }),
      prisma.contribution.count(),
    ]),
    prisma.activityEvent.findMany({
      where: { kind: { in: [...supportKinds] } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, kind: true, text: true, metadata: true, createdAt: true },
    }),
  ]);

  const [usersTotal, classesTotal, collectionsTotal, paidContributions, contributionsTotal] = totals;
  const paidPercent = contributionsTotal > 0 ? Math.round((paidContributions / contributionsTotal) * 100) : 0;
  const recentClassIds = Array.from(
    new Set(
      recentEvents
        .map((event) => metadataString(asMetadata(event.metadata).classId))
        .filter((classId): classId is string => Boolean(classId)),
    ),
  );
  const recentClasses = recentClassIds.length
    ? await prisma.schoolClass.findMany({
        where: { id: { in: recentClassIds } },
        select: { id: true, name: true },
      })
    : [];
  const classNameById = new Map(recentClasses.map((schoolClass) => [schoolClass.id, schoolClass.name]));

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div>
        <Link href="/classes" className="text-sm text-stone-500 hover:text-brandDark">
          ← К классам
        </Link>
        <p className="mt-4 text-sm font-medium uppercase tracking-wide text-brand">Админка</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">Метрики КлассКассы</h1>
        <p className="mt-1 text-sm text-stone-600">
          Доступ только для {adminEmail ?? "email из METRICS_ADMIN_EMAIL"}. Остальные пользователи получают 404.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          ["Пользователи", usersTotal],
          ["Классы", classesTotal],
          ["Сборы", collectionsTotal],
          ["Оплаченные взносы", `${paidContributions}/${contributionsTotal} (${paidPercent}%)`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</div>
            <div className="mt-1 text-2xl font-bold text-stone-900">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Поддержка и донаты</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="border-b border-stone-200 py-2 pr-3">Событие</th>
                <th className="border-b border-stone-200 py-2 pr-3">7 дней</th>
                <th className="border-b border-stone-200 py-2 pr-3">30 дней</th>
                <th className="border-b border-stone-200 py-2">Всего</th>
              </tr>
            </thead>
            <tbody>
              {supportKinds.map((kind) => (
                <tr key={kind}>
                  <td className="border-b border-stone-100 py-2 pr-3 font-medium text-stone-800">{supportLabels[kind]}</td>
                  <td className="border-b border-stone-100 py-2 pr-3">{metricFromGroups(weekGroups, kind)}</td>
                  <td className="border-b border-stone-100 py-2 pr-3">{metricFromGroups(monthGroups, kind)}</td>
                  <td className="border-b border-stone-100 py-2">{metricFromGroups(allGroups, kind)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Последние события поддержки</h2>
        {recentEvents.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Событий пока нет.</p>
        ) : (
          <ul className="mt-3 max-h-96 space-y-3 overflow-y-auto text-sm">
            {recentEvents.map((event) => {
              const meta = asMetadata(event.metadata);
              const location = locationLabel(metadataString(meta.location));
              const classId = metadataString(meta.classId);
              const className = classId ? (classNameById.get(classId) ?? "класс не найден") : null;

              return (
                <li key={event.id} className="rounded-xl border border-stone-200 p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium text-stone-900">
                      {supportLabels[event.kind as (typeof supportKinds)[number]] ?? event.text}
                    </span>
                    <time className="text-xs text-stone-500">{fmtDate(event.createdAt)}</time>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                    {location ? <span className="rounded-full bg-stone-100 px-2 py-1">Место: {location}</span> : null}
                    {className ? (
                      <span className="rounded-full bg-brandLight px-2 py-1 text-brandDark">Класс: {className}</span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
