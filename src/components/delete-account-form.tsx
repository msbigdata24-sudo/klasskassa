"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isReadyToSubmit = password.length > 0 && confirmText.trim().toUpperCase() === "УДАЛИТЬ";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isReadyToSubmit) {
      setError("Введите пароль и слово УДАЛИТЬ для подтверждения");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось удалить аккаунт");
        return;
      }
      router.replace("/?account-deleted=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
      <p className="text-xs text-stone-700">
        Удаление аккаунта необратимо. Будут удалены: ваши сообщения в групповых и личных чатах, push-подписки,
        настройки уведомлений, дружеские связи, заявки на участие в Тайных Сантах. Финансовая история в группах
        (расходы, погашения, дольки) останется у других участников в обезличенном виде — вы будете показаны как
        «Удалённый пользователь».
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Текущий пароль</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">
          Введите слово <strong className="font-semibold text-rose-700">УДАЛИТЬ</strong> заглавными буквами для подтверждения
        </span>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !isReadyToSubmit}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Удаляем…" : "Удалить аккаунт навсегда"}
      </button>
    </form>
  );
}
