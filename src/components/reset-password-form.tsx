"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("В ссылке нет токена. Откройте письмо ещё раз или запросите новую ссылку.");
      return;
    }
    if (password !== password2) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось сменить пароль");
        return;
      }
      router.push("/login?reset=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-3 text-sm text-stone-600">
        <p>Некорректная ссылка. Запросите сброс пароля снова.</p>
        <Link className="font-medium text-rind underline-offset-2 hover:underline" href="/forgot-password">
          Забыли пароль
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Новый пароль</span>
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
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Повторите пароль</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          minLength={6}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-soft-3d min-h-11 rounded-xl py-2.5 text-sm font-semibold"
      >
        {loading ? "Сохраняем…" : "Сохранить новый пароль"}
      </button>
    </form>
  );
}
