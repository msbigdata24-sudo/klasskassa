import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Вход</h1>
        <p className="mt-1 text-sm text-stone-600">Добро пожаловать в КлассКассу</p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <Suspense fallback={<p className="text-sm text-stone-500">Загрузка…</p>}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="text-center text-sm text-stone-600">
        Нет аккаунта?{" "}
        <Link className="font-medium text-brandDark underline-offset-2 hover:underline" href={registerHref}>
          Регистрация
        </Link>
      </p>
    </main>
  );
}
