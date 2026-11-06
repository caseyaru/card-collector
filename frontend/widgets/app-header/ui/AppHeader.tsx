"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav } from "@/shared/config/nav";
import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui";

/** Шапка приложения: навигация строкой на десктопе и бургер-меню на мобильных. */
export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // При переходе на другую страницу мобильное меню закрывается.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape и клик вне шапки закрывают меню.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-10 border-b border-line bg-white/75 backdrop-blur"
    >
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <Image
            src="/icon.png"
            alt=""
            width={585}
            height={446}
            priority
            className="h-8 w-auto"
          />
          <span>
            Card <span className="text-brand-pink-deep">Collector</span>
          </span>
        </Link>

        {/* Десктоп: ссылки в строку. */}
        <nav aria-label="Основная навигация" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink",
                      active
                        ? "bg-brand-pink/15 font-medium text-brand-pink-deep"
                        : "text-ink-soft hover:bg-brand-lilac/30 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Мобильные: кнопка-бургер. */}
        <button
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-brand-lilac/30 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink md:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            {menuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </Container>

      {/* Мобильное меню: те же ссылки, что и в строке на десктопе. */}
      {menuOpen ? (
        <div className="border-t border-line bg-white/95 shadow-sm backdrop-blur md:hidden">
          <Container>
            <nav id="mobile-nav" aria-label="Мобильная навигация">
              <ul className="flex flex-col gap-1 py-3">
                {mainNav.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink",
                          active
                            ? "bg-brand-pink/15 font-medium text-brand-pink-deep"
                            : "text-ink-soft hover:bg-brand-lilac/30 hover:text-ink",
                        )}
                      >
                        {item.label}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-brand-pink"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
