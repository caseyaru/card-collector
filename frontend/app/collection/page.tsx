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
          className="flex items-center justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Повторить
          </Button>
        </div>
      ) : null}

      {collections === null && !error ? (
        <p className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Загружаем коллекции…
        </p>
      ) : null}

      {collections !== null && collections.length === 0 && !error ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
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
                className="group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <span className="font-medium">{collection.name}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {pluralizeCards(collection.cardsCount)}
                </span>
                <span className="text-sm text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-500">
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
