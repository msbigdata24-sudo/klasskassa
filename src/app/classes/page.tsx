import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClassesListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const classes = await prisma.schoolClass.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: { select: { members: true, collections: true } },
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Классы</h1>
          <p className="mt-1 text-sm text-stone-600">5А, 9Б — каждый класс со своими сборами и взносами</p>
        </div>
        <Link href="/classes/new" className="btn-soft-3d shrink-0 px-4 py-2 text-sm font-semibold">
          Новый класс
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-stone-600 shadow-sm ring-1 ring-stone-200/80">
          Пока нет классов. Создайте первый и пригласите родителей по ссылке или email.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {classes.map((c) => (
            <li key={c.id}>
              <Link
                href={`/classes/${c.id}`}
                className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80 transition hover:ring-brand/40"
              >
                <span className="font-semibold text-stone-900">{c.name}</span>
                <p className="mt-1 text-sm text-stone-600">
                  {c._count.members} родителей · {c._count.collections} сборов
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
