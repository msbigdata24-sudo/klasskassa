"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

type UserView = {
  id: string;
  email: string;
  name: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav({ user }: { user: UserView | null }) {
  const pathname = usePathname();

  const linkClass = (href: string) => {
    const active = isActive(pathname, href);
    return active
      ? "rounded-md border border-brand/40 bg-brand/15 px-2 py-1 font-semibold text-brandDark shadow-sm"
      : "rounded-md border border-transparent px-2 py-1 text-stone-600 hover:border-brand/20 hover:text-brandDark";
  };

  return (
    <nav className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1 text-sm text-stone-600">
      {user ? (
        <>
          <Link className={linkClass("/")} href="/">
            Главная
          </Link>
          <Link className={linkClass("/classes")} href="/classes">
            Классы
          </Link>
          <span className="max-w-[10rem] truncate text-stone-500" title={user.email}>
            {user.name}
          </span>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link className={linkClass("/login")} href="/login">
            Вход
          </Link>
          <Link className={linkClass("/register")} href="/register">
            Регистрация
          </Link>
        </>
      )}
    </nav>
  );
}
