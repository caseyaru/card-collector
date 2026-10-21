import Link from "next/link";
import { mainNav } from "@/shared/config/nav";
import { Container } from "@/shared/ui";

/** Подвал приложения. */
export function AppFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <Container className="flex flex-col gap-3 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>Card Collector — учёт коллекции карточек.</p>
        <ul className="flex flex-wrap gap-4">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
