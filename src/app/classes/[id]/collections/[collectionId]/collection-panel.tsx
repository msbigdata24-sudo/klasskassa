"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Contribution = {
  id: string;
  userId: string;
  name: string;
  isGuest: boolean;
  isPaid: boolean;
  markedByParent: boolean;
  receiptUrl: string | null;
  paidAt: string | null;
  comment: string;
};

export function CollectionPanel({
  classId,
  collectionId,
  isCommittee,
  currentUserId,
  reportUrl,
  exportUrl,
  contributions,
}: {
  classId: string;
  collectionId: string;
  isCommittee: boolean;
  currentUserId: string;
  reportUrl: string;
  exportUrl: string;
  contributions: Contribution[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetUserId, setTargetUserId] = useState(currentUserId);
  const [openReceipt, setOpenReceipt] = useState<{ url: string; name: string } | null>(null);
  const [shareUrl, setShareUrl] = useState(reportUrl);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const mine = contributions.find((c) => c.userId === currentUserId);

  useEffect(() => {
    setShareUrl(reportUrl.startsWith("http") ? reportUrl : `${window.location.origin}${reportUrl}`);
  }, [reportUrl]);

  async function markPaid(userId: string, isPaid: boolean) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/collections/${collectionId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPaid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось обновить статус");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function uploadReceipt(userId: string) {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Выберите фото чека");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("userId", userId);
      const res = await fetch(`/api/classes/${classId}/collections/${collectionId}/receipt`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось загрузить чек");
        return;
      }
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const paid = contributions.filter((c) => c.isPaid && c.receiptUrl);
  const unpaid = contributions.filter((c) => !c.isPaid || !c.receiptUrl);

  function isImageReceipt(url: string) {
    return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
  }

  function receiptViewUrl(url: string) {
    return url.replace(/^\/uploads\/receipts\//, "/api/receipts/");
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareUrl(true);
      window.setTimeout(() => setCopiedShareUrl(false), 1800);
    } catch {
      setError("Не удалось скопировать ссылку. Скопируйте её вручную.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-brandLight p-4 ring-1 ring-brand/20">
        <h2 className="font-semibold text-brandDark">Статус оплаты</h2>
        <p className="mt-1 text-2xl font-bold text-stone-900">
          Оплатили: {paid.length} из {contributions.length}
        </p>
        <div className="mt-2 flex flex-col gap-2 text-sm text-brandDark sm:flex-row sm:items-center">
          <span className="font-medium">Ссылка для чата:</span>
          <a href={reportUrl} className="break-all underline" target="_blank" rel="noreferrer">
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={() => void copyShareUrl()}
            className="shrink-0 rounded-lg border border-brand/30 bg-white px-2.5 py-1 text-xs font-semibold text-brandDark hover:bg-brandLight"
          >
            {copiedShareUrl ? "Скопировано" : "Скопировать"}
          </button>
        </div>
        <a href={exportUrl} className="mt-3 inline-block text-sm font-medium text-brand underline">
          Скачать Excel
        </a>
      </section>

      {mine && !isCommittee ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Мой взнос</h2>
          <p className="mt-1 text-sm text-stone-600">
            Статус: {mine.isPaid && mine.receiptUrl ? "оплачено, чек прикреплён" : "нужен чек для зачёта оплаты"}
            {mine.markedByParent ? " (отметили сами)" : ""}
          </p>
          {!(mine.isPaid && mine.receiptUrl) ? (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-xs text-stone-500">Прикрепите фото или PDF чека — после этого взнос считается оплаченным.</p>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="text-sm" />
              <button
                type="button"
                disabled={loading}
                onClick={() => void uploadReceipt(currentUserId)}
                className="rounded-xl border border-brand px-3 py-2 text-sm font-medium text-brandDark"
              >
                Прикрепить чек и засчитать оплату
              </button>
            </div>
          ) : mine.receiptUrl ? (
            <button
              type="button"
              className="mt-2 inline-block text-sm text-brand underline"
              onClick={() => setOpenReceipt({ url: receiptViewUrl(mine.receiptUrl!), name: mine.name })}
            >
              Открыть чек
            </button>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Кто сдал</h2>
        {paid.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Пока никто.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {paid.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <span>
                  {c.name}
                  {c.isGuest ? " (гость)" : ""}
                </span>
                <span className="text-green-700">оплачено</span>
                {c.receiptUrl ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-brand underline"
                    onClick={() => setOpenReceipt({ url: receiptViewUrl(c.receiptUrl!), name: c.name })}
                  >
                    Показать чек
                  </button>
                ) : null}
                {isCommittee ? (
                  <button
                    type="button"
                    className="text-xs text-stone-500 underline"
                    onClick={() => void markPaid(c.userId, false)}
                  >
                    снять отметку
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Кто не сдал</h2>
        {unpaid.length === 0 ? (
          <p className="mt-2 text-sm text-green-700">Все сдали!</p>
        ) : (
          <ul className="mt-2 space-y-3 text-sm">
            {unpaid.map((c) => (
              <li key={c.id} className="border-b border-stone-100 pb-2">
                <div className="flex justify-between gap-2">
                  <span>
                    {c.name}
                    {c.isGuest ? " (гость)" : ""}
                  </span>
                  <span className="text-amber-700">{c.isPaid && !c.receiptUrl ? "нет чека" : "не оплачено"}</span>
                </div>
                {isCommittee ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUserId(c.userId);
                        fileRef.current?.click();
                      }}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
                    >
                      Прикрепить чек
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isCommittee ? (
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={() => void uploadReceipt(targetUserId)}
        />
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {openReceipt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-stone-900">Чек: {openReceipt.name}</h2>
              <button type="button" className="rounded-lg border border-stone-300 px-3 py-1 text-sm" onClick={() => setOpenReceipt(null)}>
                Закрыть
              </button>
            </div>
            <div className="overflow-auto rounded-xl bg-stone-50 p-2">
              {isImageReceipt(openReceipt.url) ? (
                <img src={openReceipt.url} alt={`Чек: ${openReceipt.name}`} className="mx-auto max-h-[75vh] max-w-full object-contain" />
              ) : (
                <iframe src={openReceipt.url} title={`Чек: ${openReceipt.name}`} className="h-[75vh] w-full rounded-lg bg-white" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
