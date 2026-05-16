"use client";

import { clearAllOfflineQueues } from "@/lib/offline-queue";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="text-sm text-stone-500 underline-offset-2 hover:text-rind hover:underline"
      onClick={async () => {
        await clearAllOfflineQueues().catch(() => null);
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Выйти
    </button>
  );
}
