"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось создать класс");
        return;
      }
      router.push(`/classes/${data.class.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <Link href="/classes" className="text-sm text-stone-500 hover:text-brandDark">
        ← к классам
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Новый класс</h1>
        <p className="mt-1 text-sm text-stone-600">Вы станете в родительском комитете этого класса</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Название класса</span>
          <input
            className="rounded-xl border border-stone-300 px-3 py-2 outline-none ring-brand/40 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="5А"
            required
            maxLength={120}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn-soft-3d py-2.5 text-sm font-semibold">
          {loading ? "Создаём…" : "Создать класс"}
        </button>
      </form>
    </main>
  );
}
