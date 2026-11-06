"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CardSetWithStats } from "@/entities/set";
import { CreateSetDialog } from "@/features/create-set";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Список сетов + создание сета через попап. */
export default function SetsPage() {
  const [sets, setSets] = useState<CardSetWithStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSets(await fetchJson<CardSetWithStats[]>("/api/sets"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить сеты");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title="Сеты"
        description="Сет — это набор, к которому относится карточка. У карточки может быть не более одного сета."
        actions={<CreateSetDialog onAdded={() => void load()} />}
      />

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

      {sets === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем сеты…
        </p>
      ) : null}

      {sets !== null && sets.length === 0 && !error ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            Сетов пока нет. Нажмите «Создать сет» или добавьте название прямо в
            форме карточки.
          </p>
        </div>
      ) : null}

      {sets !== null && sets.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <li key={set.id}>
              <Link
                href={`/sets/${encodeURIComponent(set.name)}`}
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/30 hover:shadow-lg hover:shadow-brand-pink/10"
              >
                <span className="font-medium">{set.name}</span>
                <span className="text-sm text-muted">
                  {pluralizeCards(set.cardsCount)}
                </span>
                <span className="text-sm text-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand-pink-deep">
                  Открыть →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
