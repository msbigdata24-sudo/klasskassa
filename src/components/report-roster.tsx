"use client";

import { useMemo, useState } from "react";

type Person = { name: string; note?: string | null };

export function ReportRoster({
  paid,
  unpaid,
}: {
  paid: Person[];
  unpaid: Person[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

  const q = query.trim().toLowerCase();

  const filteredPaid = useMemo(
    () => paid.filter((p) => !q || p.name.toLowerCase().includes(q)),
    [paid, q],
  );
  const filteredUnpaid = useMemo(
    () => unpaid.filter((p) => !q || p.name.toLowerCase().includes(q)),
    [unpaid, q],
  );

  const showPaid = filter === "all" || filter === "paid";
  const showUnpaid = filter === "all" || filter === "unpaid";

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          placeholder="Поиск по имени…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-11 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:ring-2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Все</option>
          <option value="paid">Сдали</option>
          <option value="unpaid">Не сдали</option>
        </select>
      </div>

      {showPaid ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-green-800">Сдали ({filteredPaid.length})</h2>
          {filteredPaid.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">Никого не найдено.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {filteredPaid.map((c, i) => (
                <li key={`p-${i}`}>
                  {c.name}
                  {c.note ? <span className="text-stone-400"> · {c.note}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showUnpaid ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-amber-800">Не сдали ({filteredUnpaid.length})</h2>
          {filteredUnpaid.length === 0 ? (
            <p className="mt-2 text-sm text-green-700">{unpaid.length === 0 ? "Все сдали — спасибо!" : "Никого не найдено."}</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {filteredUnpaid.map((c, i) => (
                <li key={`u-${i}`}>{c.name}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
