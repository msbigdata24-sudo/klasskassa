"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/welcome";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Подтвердите согласие с Политикой конфиденциальности и Пользовательским соглашением");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, consent: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось зарегистрироваться");
        return;
      }
      router.push(next.startsWith("/") ? next : "/welcome");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Как вас называть</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Email</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Пароль (от 6 символов)</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </label>
      <label className="flex items-start gap-2 text-xs text-stone-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-peel"
          required
        />
        <span>
          Я ознакомлен и согласен с{" "}
          <Link href="/privacy" target="_blank" className="text-rind underline hover:text-peel">
            Политикой конфиденциальности
          </Link>{" "}
          и{" "}
          <Link href="/offer" target="_blank" className="text-rind underline hover:text-peel">
            Пользовательским соглашением
          </Link>
          ; даю согласие на обработку моих персональных данных (имя, email и данные о моей активности в Сервисе) в
          объёме и на условиях, описанных в Политике.
        </span>
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !consent}
        className="btn-soft-3d min-h-11 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Создаём…" : "Создать аккаунт"}
      </button>
    </form>
  );
}
