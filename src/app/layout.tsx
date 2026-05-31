import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isMetricsAdminEmail } from "@/lib/env";
import { CookieConsent } from "@/components/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNav } from "@/components/top-nav";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "КлассКасса — родительские сборы",
  description: "Учёт школьных сборов: кто сдал, кто нет. Без приёма денег через сервис.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const isMetricsAdmin = user ? isMetricsAdminEmail(user.email) : false;

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('klasskassa-theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.className} font-sans`}>
        <ThemeProvider>
        <ToastProvider>
          <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-10 pt-6 sm:max-w-2xl">
            <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className="text-lg font-semibold tracking-tight text-brandDark">
                КлассКасса
              </Link>
              <TopNav user={user} isMetricsAdmin={isMetricsAdmin} />
            </header>
            {children}
            <footer className="mt-8 border-t border-stone-200 pt-4 text-xs text-stone-500">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/privacy" className="hover:text-brand">
                  Политика конфиденциальности
                </Link>
                <Link href="/offer" className="hover:text-brand">
                  Пользовательское соглашение
                </Link>
                <Link href="/contacts" className="hover:text-brand">
                  Контакты
                </Link>
                <Link href="/support" className="hover:text-brand">
                  Поддержать проект
                </Link>
              </div>
              <p className="mt-2 text-stone-400">
                © 2026 КлассКасса · Учёт родительских взносов · Не является платёжной системой
              </p>
            </footer>
          </div>
          <CookieConsent />
        </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
