import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Забыли пароль</h1>
        <p className="mt-1 text-sm text-stone-600">
          Укажите email — отправим ссылку для установки нового пароля (если аккаунт есть).
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
        <Suspense fallback={<p className="text-sm text-stone-500">Загрузка…</p>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
      <p className="text-center text-sm text-stone-600">
        Вспомнили пароль?{" "}
        <Link className="font-medium text-rind underline-offset-2 hover:underline" href="/login">
          Вход
        </Link>
      </p>
    </main>
  );
}
