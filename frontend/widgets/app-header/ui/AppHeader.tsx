"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/shared/config/nav";
import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui";

/** Шапка приложения с основной навигацией. */
export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Card Collector
        </Link>

        <nav aria-label="Основная навигация">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
