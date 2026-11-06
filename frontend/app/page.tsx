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
          .map((item, index) => {
            const accents = ["bg-brand-pink", "bg-brand-blue", "bg-brand-gold"];

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/30 hover:shadow-lg hover:shadow-brand-pink/10"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${
                      accents[index % accents.length]
                    }`}
                  />
                  {item.label}
                </span>
                <span className="text-sm text-muted">{item.description}</span>
                <span className="text-sm text-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand-pink-deep">
                  Перейти →
                </span>
              </Link>
            );
          })}
      </section>
    </Container>
  );
}
