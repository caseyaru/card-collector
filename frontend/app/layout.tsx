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
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-sans text-ink">
        {/* usePathname() в шапке недоступен при статическом рендере —
            поэтому шапка стримится за границей Suspense. */}
        <Suspense
          fallback={
            <div className="h-14 border-b border-line bg-white/75 backdrop-blur" />
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
