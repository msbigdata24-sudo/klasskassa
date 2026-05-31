"use client";

export function LoadingOverlay({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 p-4" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg ring-1 ring-stone-200">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <span className="text-sm font-medium text-stone-800">{label}</span>
      </div>
    </div>
  );
}

export function CollectionProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const tone =
    pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-brand" : pct >= 30 ? "bg-amber-500" : "bg-stone-400";

  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-stone-600">
        <span>
          {paid} из {total} сдали
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-stone-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
