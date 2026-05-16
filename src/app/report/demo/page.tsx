import Link from "next/link";

export const metadata = {
  title: "Пример отчёта — КлассКасса",
  description: "Демонстрация публичного отчёта «кто сдал / кто не сдал» для родительского чата",
};

/** Статичный пример отчёта для лендинга (без БД). */
export default function DemoReportPage() {
  const paid = [
    { name: "Иванова М.", self: true },
    { name: "Петров А.", self: false },
    { name: "Сидорова Е.", self: true },
  ];
  const unpaid = [{ name: "Козлов Д." }, { name: "Новикова И." }];

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">КлассКасса · пример отчёта</p>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">9«А»</h1>
      <p className="mt-1 text-lg text-stone-800">Выпускной взнос</p>
      <p className="mt-2 text-sm text-stone-600">Взнос: 1 500 ₽ · срок: 20 мая</p>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-brand/30 bg-brandLight p-3 text-center text-xs text-brandDark">
        Это демо-страница. В реальном классе ссылка уникальная и обновляется автоматически.
      </div>

      <div className="mt-4 rounded-2xl bg-brandLight p-4 text-center">
        <p className="text-3xl font-bold text-brandDark">
          {paid.length} / {paid.length + unpaid.length}
        </p>
        <p className="text-sm text-stone-600">родителей сдали взнос</p>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-green-800">Сдали ({paid.length})</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {paid.map((c) => (
            <li key={c.name}>
              {c.name}
              {c.self ? <span className="text-stone-400"> · отметил сам</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-amber-800">Не сдали ({unpaid.length})</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {unpaid.map((c) => (
            <li key={c.name}>{c.name}</li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-center">
        <Link href="/register" className="btn-soft-3d inline-flex px-5 py-2.5 text-sm font-semibold">
          Создать такой отчёт для своего класса
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-stone-400">
        <Link href="/" className="text-brand underline">
          ← На главную
        </Link>
      </p>
    </main>
  );
}
