"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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

  const mine = contributions.find((c) => c.userId === currentUserId);

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

  const paid = contributions.filter((c) => c.isPaid);
  const unpaid = contributions.filter((c) => !c.isPaid);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-brandLight p-4 ring-1 ring-brand/20">
        <h2 className="font-semibold text-brandDark">Статус оплаты</h2>
        <p className="mt-1 text-2xl font-bold text-stone-900">
          {paid.length} / {contributions.length} сдали
        </p>
        <p className="mt-2 break-all text-sm text-brandDark">
          Ссылка для WhatsApp:{" "}
          <a href={reportUrl.startsWith("http") ? reportUrl : reportUrl} className="underline" target="_blank" rel="noreferrer">
            {reportUrl}
          </a>
        </p>
        <a href={exportUrl} className="mt-3 inline-block text-sm font-medium text-brand underline">
          Скачать Excel (CSV)
        </a>
      </section>

      {mine && !isCommittee ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Мой взнос</h2>
          <p className="mt-1 text-sm text-stone-600">
            Статус: {mine.isPaid ? "оплачено" : "не оплачено"}
            {mine.markedByParent ? " (отметили сами)" : ""}
          </p>
          {!mine.isPaid ? (
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => void markPaid(currentUserId, true)}
                className="btn-soft-3d text-sm font-semibold"
              >
                Я оплатил
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="text-sm" />
              <button
                type="button"
                disabled={loading}
                onClick={() => void uploadReceipt(currentUserId)}
                className="rounded-xl border border-brand px-3 py-2 text-sm font-medium text-brandDark"
              >
                Прикрепить чек и отметить оплату
              </button>
            </div>
          ) : mine.receiptUrl ? (
            <a href={mine.receiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand underline">
              Открыть чек
            </a>
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
                  <span className="text-amber-700">не оплачено</span>
                </div>
                {isCommittee ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void markPaid(c.userId, true)}
                      className="rounded-lg bg-brand/10 px-2 py-1 text-xs font-medium text-brandDark"
                    >
                      Отметить оплату
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUserId(c.userId);
                        fileRef.current?.click();
                      }}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
                    >
                      Чек за родителя
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
    </div>
  );
}
