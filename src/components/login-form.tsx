"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/welcome";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetBanner, setResetBanner] = useState(false);

  useEffect(() => {
    setResetBanner(searchParams.get("reset") === "1");
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось войти");
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
      {resetBanner ? (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-900 ring-1 ring-green-100">
          Пароль обновлён. Войдите с новым паролем.
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Email</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-brand/40 focus:ring-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Пароль</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-brand/40 focus:ring-2"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-soft-3d min-h-11 rounded-xl py-2.5 text-sm font-semibold"
      >
        {loading ? "Входим…" : "Войти"}
      </button>
      <p className="text-center text-sm">
        <a className="font-medium text-brandDark underline-offset-2 hover:underline" href="/forgot-password">
          Забыли пароль?
        </a>
      </p>
    </form>
  );
}
