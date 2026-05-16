import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <main className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Регистрация</h1>
        <p className="mt-1 text-sm text-stone-600">Email и пароль — для родителей и родительского комитета</p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-stone-600">
        Уже есть аккаунт?{" "}
        <Link className="font-medium text-rind underline-offset-2 hover:underline" href={loginHref}>
          Войти
        </Link>
      </p>
    </main>
  );
}
