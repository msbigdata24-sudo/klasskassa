"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRub } from "@/lib/money";
import { SupportEventPing } from "@/components/support-events";

type Member = { id: string; name: string; email: string | null; isGuest: boolean; role: string };
type Collection = {
  id: string;
  title: string;
  amountCents: number;
  deadline: string | null;
  publicReportCode: string;
  paidCount: number;
  total: number;
};
type HistoryItem = { id: string; text: string; createdAt: string };

export function ClassDetailPanel({
  classId,
  isCommittee,
  invitePath,
  inviteAbsolute,
  members,
  collections,
  history,
}: {
  classId: string;
  isCommittee: boolean;
  currentUserId: string;
  invitePath: string;
  inviteAbsolute: string;
  members: Member[];
  collections: Collection[];
  history: HistoryItem[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function addMember() {
    setError(null);
    setLoading(true);
    try {
      const body = guestName.trim() ? { guestName: guestName.trim() } : { email: email.trim() };
      const res = await fetch(`/api/classes/${classId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось добавить");
        return;
      }
      setEmail("");
      setGuestName("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: collectionTitle, amountRub: collectionAmount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось создать сбор");
        return;
      }
      setCollectionTitle("");
      setCollectionAmount("");
      router.push(`/classes/${classId}/collections/${data.collection.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inviteLink =
    inviteAbsolute || (typeof window !== "undefined" ? `${window.location.origin}${invitePath}` : invitePath);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Приглашение в класс</h2>
        <p className="mt-1 text-sm text-stone-600">Отправьте ссылку родителям в WhatsApp</p>
        <p className="mt-2 break-all rounded-lg bg-brandLight px-3 py-2 text-sm text-brandDark">{inviteLink}</p>
      </section>

      {isCommittee ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Родители класса</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {members.map((m) => (
              <li key={m.id} className="flex justify-between gap-2">
                <span>
                  {m.name}
                  {m.isGuest ? <span className="text-stone-400"> (гость)</span> : null}
                </span>
                <span className="text-stone-500">{m.role === "COMMITTEE" ? "комитет" : "родитель"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4">
            <input
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              placeholder="Email родителя"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              placeholder="Или имя гостя (без email)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void addMember()}
              className="btn-soft-3d text-sm font-semibold"
            >
              Добавить родителя
            </button>
          </div>
        </section>
      ) : null}

      {isCommittee ? (
        <form onSubmit={createCollection} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
          <h2 className="font-semibold text-stone-900">Новый сбор</h2>
          <div className="mt-3 flex flex-col gap-2">
            <input
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              placeholder="Название (например, Подарок учителю)"
              value={collectionTitle}
              onChange={(e) => setCollectionTitle(e.target.value)}
              required
            />
            <input
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              placeholder="Сумма взноса, ₽"
              value={collectionAmount}
              onChange={(e) => setCollectionAmount(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn-soft-3d text-sm font-semibold">
              Создать сбор
            </button>
          </div>
        </form>
      ) : null}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">Сборы</h2>
        {collections.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Сборов пока нет.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {collections.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/classes/${classId}/collections/${c.id}`}
                  className="block rounded-xl border border-stone-200 p-3 hover:border-brand/40"
                >
                  <div className="font-medium text-stone-900">{c.title}</div>
                  <p className="text-sm text-stone-600">
                    {formatRub(c.amountCents)} · оплатили {c.paidCount}/{c.total}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-brandLight p-4 ring-1 ring-brand/20">
        <SupportEventPing event="DONATE_BLOCK_VIEWED_CLASS" location="class_detail" classId={classId} />
        <h2 className="font-semibold text-brandDark">Поддержать КлассКассу</h2>
        <p className="mt-1 text-sm text-stone-600">
          Сервис бесплатен на старте. Если он сэкономил время родкому, можно поддержать разработку любой суммой.
        </p>
        <Link
          href="/support"
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brandDark ring-1 ring-brand/30 hover:bg-brandLight"
        >
          Открыть QR и ссылку Ozon
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80">
        <h2 className="font-semibold text-stone-900">История</h2>
        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm text-stone-600">
          {history.map((h) => (
            <li key={h.id}>
              <time className="text-xs text-stone-400">{new Date(h.createdAt).toLocaleString("ru-RU")}</time>
              <div>{h.text}</div>
            </li>
          ))}
        </ul>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
