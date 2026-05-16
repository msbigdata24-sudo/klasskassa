"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось отправить запрос");
        return;
      }
      setMessage(typeof data.message === "string" ? data.message : "Проверьте почту.");
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Email аккаунта</span>
        <input
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-peel/40 focus:ring-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-800">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-soft-3d min-h-11 rounded-xl py-2.5 text-sm font-semibold"
      >
        {loading ? "Отправляем…" : "Отправить ссылку"}
      </button>
      <p className="text-center text-sm text-stone-600">
        <Link className="font-medium text-rind underline-offset-2 hover:underline" href="/login">
          Назад ко входу
        </Link>
      </p>
    </form>
  );
}
