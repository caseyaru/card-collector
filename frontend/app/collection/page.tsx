"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CollectionWithStats } from "@/entities/collection";
import { CreateCollectionDialog } from "@/features/create-collection";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Список коллекций + создание коллекции через попап. */
export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionWithStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCollections(await fetchJson<CollectionWithStats[]>("/api/collections"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить коллекции");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title="Коллекции"
        description="Коллекции объединяют карточки по темам. Одна карточка может входить в несколько коллекций."
        actions={<CreateCollectionDialog onAdded={() => void load()} />}
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

      {collections === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем коллекции…
        </p>
      ) : null}

      {collections !== null && collections.length === 0 && !error ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            Коллекций пока нет. Нажмите «Создать коллекцию», чтобы начать.
          </p>
        </div>
      ) : null}

      {collections !== null && collections.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/collection/${encodeURIComponent(collection.name)}`}
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/30 hover:shadow-lg hover:shadow-brand-pink/10"
              >
                <span className="font-medium">{collection.name}</span>
                <span className="text-sm text-muted">
                  {pluralizeCards(collection.cardsCount)}
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
