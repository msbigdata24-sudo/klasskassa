"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function JoinCard({ code, autoJoin = false }: { code: string; autoJoin?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedHint, setJoinedHint] = useState<string | null>(null);
  const autoJoinStarted = useRef(false);

  async function join(showHint = false) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/invite/${code}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не получилось вступить в класс");
        return;
      }
      if (showHint) {
        setJoinedHint("Вы успешно вошли. Открываем класс...");
      }
      router.push(`/classes/${data.classId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoJoin || autoJoinStarted.current) return;
    autoJoinStarted.current = true;
    void join(true);
  }, [autoJoin]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
      <h1 className="text-2xl font-bold text-stone-900">Вступить в класс</h1>
      <p className="mt-2 text-sm text-stone-600">
        {autoJoin
          ? "Пробуем автоматически подключить вас к классу по приглашению..."
          : "Нажмите кнопку ниже, чтобы присоединиться по ссылке-приглашению."}
      </p>
      {joinedHint ? <p className="mt-2 text-sm text-emerald-700">{joinedHint}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        className="btn-soft-3d mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold"
        disabled={loading}
        onClick={() => join(false)}
      >
        {loading ? "Вступаем..." : "Вступить"}
      </button>
    </div>
  );
}
