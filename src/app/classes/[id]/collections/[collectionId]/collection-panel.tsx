"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CollectionProgressBar, LoadingOverlay } from "@/components/collection-ui";

type Contribution = {
  id: string;
  userId: string;
  name: string;
  isGuest: boolean;
  isPaid: boolean;
  markedByParent: boolean;
  receiptUrl: string | null;
  receiptMime: string | null;
  receiptStored: boolean;
  receiptDeletedAt: string | null;
  paidAt: string | null;
  comment: string;
};

export function CollectionPanel({
  classId,
  collectionId,
  isCommittee,
  isViewer,
  canUploadReceipt,
  currentUserId,
  reportUrl,
  publicReportEnabled,
  publicReportExpiresAt,
  lastReminderAt,
  exportUrl,
  exportCsvUrl,
  contributions,
}: {
  classId: string;
  collectionId: string;
  isCommittee: boolean;
  isViewer: boolean;
  canUploadReceipt: boolean;
  currentUserId: string;
  reportUrl: string;
  publicReportEnabled: boolean;
  publicReportExpiresAt: string | null;
  lastReminderAt: string | null;
  exportUrl: string;
  exportCsvUrl: string;
  contributions: Contribution[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Загрузка…");
  const [targetUserId, setTargetUserId] = useState(currentUserId);
  const [openReceipt, setOpenReceipt] = useState<{ url: string; name: string } | null>(null);
  const [shareUrl, setShareUrl] = useState(reportUrl);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);
  const [reminderInfo, setReminderInfo] = useState<string | null>(null);
  const [reportEnabled, setReportEnabled] = useState(publicReportEnabled);
  const [reportExpiresAt, setReportExpiresAt] = useState(publicReportExpiresAt);
  const [listQuery, setListQuery] = useState("");
  const [justPaidUserId, setJustPaidUserId] = useState<string | null>(null);

  const mine = contributions.find((c) => c.userId === currentUserId);

  useEffect(() => {
    setShareUrl(reportUrl.startsWith("http") ? reportUrl : `${window.location.origin}${reportUrl}`);
  }, [reportUrl]);

  useEffect(() => {
    setReportEnabled(publicReportEnabled);
    setReportExpiresAt(publicReportExpiresAt);
  }, [publicReportEnabled, publicReportExpiresAt]);

  const paid = contributions.filter(
    (c) => c.isPaid && ((c.receiptUrl && c.receiptMime && c.receiptStored) || c.receiptDeletedAt),
  );
  const unpaid = contributions.filter((c) => !c.isPaid || (!c.receiptStored && !c.receiptDeletedAt));

  const q = listQuery.trim().toLowerCase();
  const filteredPaid = useMemo(() => paid.filter((c) => !q || c.name.toLowerCase().includes(q)), [paid, q]);
  const filteredUnpaid = useMemo(() => unpaid.filter((c) => !q || c.name.toLowerCase().includes(q)), [unpaid, q]);

  async function markPaid(userId: string, isPaid: boolean) {
    setError(null);
    setLoading(true);
    setLoadingLabel("Обновляем статус…");
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
      setError("Выберите фото или PDF чека");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Допустимы только изображения или PDF");
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingLabel("Загружаем чек…");
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
      setJustPaidUserId(userId);
      window.setTimeout(() => setJustPaidUserId(null), 1200);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function manageReportLink(action: "rotate" | "disable" | "enable" | "extend") {
    setError(null);
    setLoading(true);
    setLoadingLabel("Обновляем ссылку…");
    try {
      const res = await fetch(`/api/classes/${classId}/collections/${collectionId}/report-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось обновить ссылку");
        return;
      }
      if (data.collection?.publicReportCode) {
        setShareUrl(`${window.location.origin}/report/${data.collection.publicReportCode}`);
      }
      setReportEnabled(Boolean(data.collection?.publicReportEnabled));
      setReportExpiresAt(data.collection?.publicReportExpiresAt ?? null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function isImageReceipt(url: string) {
    return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
  }

  function receiptViewUrl(url: string) {
    return url.replace(/^\/uploads\/receipts\//, "/api/receipts/");
  }

  async function sendReminder(sendEmail: boolean) {
    setError(null);
    setReminderInfo(null);
    setLoading(true);
    setLoadingLabel(sendEmail ? "Отправляем напоминания…" : "Готовим текст…");
    try {
      const res = await fetch(`/api/classes/${classId}/collections/${collectionId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось отправить напоминание");
        return;
      }
      if (typeof data.chatMessage === "string") {
        await navigator.clipboard.writeText(data.chatMessage);
        setCopiedReminder(true);
        window.setTimeout(() => setCopiedReminder(false), 2000);
      }
      const parts = [`Не сдали: ${data.unpaidCount ?? 0}`];
      if (sendEmail) {
        parts.push(`Email отправлено: ${data.emailsSent ?? 0}, пропущено: ${data.emailsSkipped ?? 0}`);
        if (!data.smtpConfigured) parts.push("SMTP не настроен на сервере");
      }
      setReminderInfo(parts.join(" · "));
      router.refresh();
    } catch {
      setError("Не удалось скопировать текст в буфер");
    } finally {
      setLoading(false);
    }
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareUrl(true);
      window.setTimeout(() => setCopiedShareUrl(false), 2000);
    } catch {
      setError("Не удалось скопировать ссылку. Скопируйте её вручную.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? <LoadingOverlay label={loadingLabel} /> : null}

      <section className="rounded-2xl bg-brandLight p-4 ring-1 ring-brand/20">
        <h2 className="font-semibold text-brandDark">Статус оплаты</h2>
        <CollectionProgressBar paid={paid.length} total={contributions.length} />
        <div className="mt-3 flex flex-col gap-2 text-sm text-brandDark sm:flex-row sm:items-center">
          <span className="font-medium">Ссылка для чата:</span>
          {!reportEnabled ? (
            <span className="text-amber-800">отключена родкомом</span>
          ) : (
            <a href={shareUrl} className="break-all underline" target="_blank" rel="noreferrer">
              {shareUrl}
            </a>
          )}
          <button
            type="button"
            onClick={() => void copyShareUrl()}
            disabled={!reportEnabled}
            className="shrink-0 rounded-lg border border-brand/30 bg-white px-2.5 py-1 text-xs font-semibold text-brandDark hover:bg-brandLight disabled:opacity-50"
          >
            {copiedShareUrl ? "✓ Скопировано" : "Скопировать"}
          </button>
        </div>
        {reportExpiresAt ? (
          <p className="mt-1 text-xs text-stone-600">
            Ссылка действует до {new Date(reportExpiresAt).toLocaleDateString("ru-RU")}
          </p>
        ) : null}
        {isCommittee ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
              onClick={() => void manageReportLink("rotate")}
            >
              Новая ссылка
            </button>
            <button
              type="button"
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
              onClick={() => void manageReportLink(reportEnabled ? "disable" : "enable")}
            >
              {reportEnabled ? "Отключить" : "Включить"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
              onClick={() => void manageReportLink("extend")}
            >
              Продлить на 180 дней
            </button>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a href={exportUrl} className="font-medium text-brand underline">
            Excel
          </a>
          <a href={exportCsvUrl} className="font-medium text-brand underline">
            CSV
          </a>
        </div>
      </section>

      {isViewer ? (
        <p className="rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-600 dark:bg-stone-800">
          У вас роль «только просмотр» — статусы видны, но чеки прикреплять нельзя.
        </p>
      ) : null}

      {isCommittee ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Напоминания</h2>
          <p className="mt-1 text-sm text-stone-600">
            Текст для чата копируется автоматически. Email — только тем, кто включил согласие в настройках класса.
          </p>
          {lastReminderAt ? (
            <p className="mt-1 text-xs text-stone-500">
              Последнее: {new Date(lastReminderAt).toLocaleString("ru-RU")}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading || unpaid.length === 0}
              onClick={() => void sendReminder(false)}
              className="min-h-10 rounded-lg border border-brand/40 bg-white px-3 py-2 text-sm font-medium text-brandDark"
            >
              {copiedReminder ? "✓ Скопировано в чат" : "Текст для чата"}
            </button>
            <button
              type="button"
              disabled={loading || unpaid.length === 0}
              onClick={() => void sendReminder(true)}
              className="min-h-10 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              + Email (с согласия)
            </button>
          </div>
          {reminderInfo ? <p className="mt-2 text-xs text-stone-500">{reminderInfo}</p> : null}
        </section>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Поиск по списку</span>
        <input
          type="search"
          value={listQuery}
          onChange={(e) => setListQuery(e.target.value)}
          placeholder="Имя родителя…"
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-brand/30 focus:ring-2"
        />
      </label>

      {mine && canUploadReceipt && !isCommittee ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Мой взнос</h2>
          <p className="mt-1 text-sm text-stone-600">
            Статус:{" "}
            {mine.isPaid && mine.receiptStored
              ? "оплачено, чек прикреплён"
              : mine.isPaid && mine.receiptDeletedAt
                ? "оплачено, чек удалён по сроку хранения"
                : "нужен чек для зачёта оплаты"}
          </p>
          {!(mine.isPaid && (mine.receiptStored || mine.receiptDeletedAt)) ? (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-xs text-stone-500">
                Прикрепите чёткое фото или PDF — без файла оплата не засчитывается. Чеки хранятся 90 дней.
              </p>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="min-h-11 text-sm" />
              <button
                type="button"
                disabled={loading}
                onClick={() => void uploadReceipt(currentUserId)}
                className="min-h-11 rounded-xl border border-brand px-3 py-2 text-sm font-medium text-brandDark"
              >
                Прикрепить чек и засчитать оплату
              </button>
            </div>
          ) : mine.receiptStored && mine.receiptUrl ? (
            <button
              type="button"
              className="mt-2 inline-block text-sm text-brand underline"
              onClick={() => setOpenReceipt({ url: receiptViewUrl(mine.receiptUrl!), name: mine.name })}
            >
              Открыть чек
            </button>
          ) : null}
        </section>
      ) : mine && isViewer ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Мой взнос</h2>
          <p className="mt-1 text-sm text-stone-600">Только просмотр — загрузка чека недоступна для вашей роли.</p>
        </section>
      ) : null}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Кто сдал</h2>
        {filteredPaid.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Пока никто.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {filteredPaid.map((c) => (
              <li
                key={c.id}
                className={`flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2 transition-colors ${
                  justPaidUserId === c.userId ? "rounded-lg bg-green-50 px-1" : ""
                }`}
              >
                <span>
                  {c.name}
                  {c.isGuest ? " (гость)" : ""}
                </span>
                <span className="text-green-700">оплачено</span>
                {c.receiptStored && c.receiptUrl ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-brand underline"
                    onClick={() => setOpenReceipt({ url: receiptViewUrl(c.receiptUrl!), name: c.name })}
                  >
                    Показать чек
                  </button>
                ) : c.receiptDeletedAt ? (
                  <span className="text-xs text-stone-500">чек удалён по сроку</span>
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
        {filteredUnpaid.length === 0 ? (
          <p className="mt-2 text-sm text-green-700">{unpaid.length === 0 ? "Все сдали!" : "Никого не найдено."}</p>
        ) : (
          <ul className="mt-2 space-y-3 text-sm">
            {filteredUnpaid.map((c) => (
              <li key={c.id} className="border-b border-stone-100 pb-2">
                <div className="flex justify-between gap-2">
                  <span>
                    {c.name}
                    {c.isGuest ? " (гость)" : ""}
                  </span>
                  <span className="text-amber-700">
                    {c.isPaid && !c.receiptStored && !c.receiptDeletedAt ? "нужен чек" : "не оплачено"}
                  </span>
                </div>
                {isCommittee ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUserId(c.userId);
                        fileRef.current?.click();
                      }}
                      className="min-h-9 rounded-lg border border-stone-300 px-2 py-1 text-xs"
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
