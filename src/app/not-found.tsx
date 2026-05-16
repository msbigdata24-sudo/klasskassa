import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-stone-900">Страница не найдена</h1>
      <p className="text-sm text-stone-600">Такой страницы в КлассКассе нет.</p>
      <Link href="/" className="text-sm font-medium text-brandDark underline-offset-2 hover:underline">
        На главную
      </Link>
    </main>
  );
}
