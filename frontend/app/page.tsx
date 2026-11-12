"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CardPreview, type Card } from "@/entities/card";
import { mainNav } from "@/shared/config/nav";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Главная: разделы приложения и все карточки в маленьких превью. */
export default function Home() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCards(await fetchJson<Card[]>("/api/cards"));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить карточки",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container className="flex flex-1 flex-col gap-10 py-16">
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

      <section
        aria-labelledby="home-cards-title"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="home-cards-title" className="text-xl font-semibold">
              Все карточки
            </h2>
            <p className="text-sm text-muted">
              {cards ? pluralizeCards(cards.length) : "Загружаем карточки…"}
            </p>
          </div>
          <Link
            href="/cards"
            className="text-sm text-muted transition-colors hover:text-brand-pink-deep"
          >
            Открыть раздел →
          </Link>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              Повторить
            </Button>
          </div>
        ) : null}

        {cards === null && !error ? (
          <ul
            aria-hidden="true"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <li
                key={index}
                className="flex flex-col gap-2 rounded-xl border border-line bg-white p-2"
              >
                <div className="aspect-[5/7] animate-pulse rounded-lg bg-lilac-soft" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-lilac-soft" />
              </li>
            ))}
          </ul>
        ) : null}

        {cards !== null && cards.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm leading-6 text-muted">
            Пока нет карточек.{" "}
            <Link href="/cards" className="underline underline-offset-4">
              Добавьте первую карточку
            </Link>
            .
          </div>
        ) : null}

        {cards !== null && cards.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {cards.map((card) => (
              <li key={card.id}>
                <CardPreview card={card} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </Container>
  );
}
