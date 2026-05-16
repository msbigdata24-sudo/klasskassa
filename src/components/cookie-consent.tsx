"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "apelsin-cookie-consent-v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accepted: true, at: new Date().toISOString() }),
      );
    } catch {
      // localStorage недоступен — просто скрываем плашку для этого сеанса.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Сообщение об использовании cookie"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-4 shadow-lg ring-1 ring-stone-200/80"
    >
      <p className="text-sm text-stone-800">
        Сервис использует строго необходимые cookie и локальное хранение для авторизации, офлайн-режима и сохранения
        ваших настроек. Сторонняя аналитика и рекламные cookie не подключаются.
      </p>
      <p className="mt-2 text-xs text-stone-500">
        Подробнее — в{" "}
        <Link href="/privacy" className="text-rind underline hover:text-peel">
          Политике конфиденциальности
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={accept}
          className="btn-soft-3d inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Понятно
        </button>
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-peel hover:text-rind"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
