import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppFooter } from "@/widgets/app-footer/ui/AppFooter";
import { AppHeader } from "@/widgets/app-header/ui/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Card Collector",
    template: "%s · Card Collector",
  },
  description: "Коллекция карточек: учёт, каталог и статистика.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
        {/* usePathname() в шапке недоступен при статическом рендере —
            поэтому шапка стримится за границей Suspense. */}
        <Suspense
          fallback={
            <div className="h-14 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80" />
          }
        >
          <AppHeader />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
