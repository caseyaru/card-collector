import Link from "next/link";
import { mainNav } from "@/shared/config/nav";
import { Button, Container, PageHeader } from "@/shared/ui";

export default function Home() {
  return (
    <Container className="flex flex-1 flex-col justify-center gap-10 py-16">
      <PageHeader
        title="Card Collector"
        description="Личная коллекция карточек: собирайте, каталогизируйте и следите за состоянием каждой карточки."
        actions={
          <>
            <Button href="/collection">Открыть коллекции</Button>
            <Button href="/cards" variant="secondary">
              Все карточки
            </Button>
          </>
        }
      />

      <section aria-label="Разделы" className="grid gap-4 sm:grid-cols-3">
        {mainNav
          .filter((item) => item.href !== "/")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {item.description}
              </span>
              <span className="text-sm text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-500">
                Перейти →
              </span>
            </Link>
          ))}
      </section>
    </Container>
  );
}
