"use client";

import { PropsWithChildren } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/45 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-stone-200">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-stone-500 hover:text-stone-700">
            Закрыть
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
