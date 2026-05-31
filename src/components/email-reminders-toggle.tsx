"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmailRemindersToggle({
  classId,
  initialOptIn,
  disabled,
}: {
  classId: string;
  initialOptIn: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/membership`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailRemindersOptIn: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось сохранить");
        return;
      }
      setOptIn(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
      <h2 className="font-semibold text-stone-900">Email-напоминания</h2>
      <label className="mt-2 flex items-start gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          checked={optIn}
          disabled={disabled || loading}
          onChange={(e) => void toggle(e.target.checked)}
          className="mt-1 h-4 w-4 accent-brand"
        />
        <span>
          Присылать на мой email напоминания о несданных взносах, если родком нажмёт «Отправить email» (добровольно,
          можно отключить в любой момент).
        </span>
      </label>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
