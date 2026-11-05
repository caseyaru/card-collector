"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { CardTile, type Card } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { CollectionWithCards } from "@/entities/collection";
import type { CardSet } from "@/entities/set";
import { CharacterFilter } from "@/features/filter-cards-by-character";
import { CardSetFilter } from "@/features/filter-cards-by-set";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Карточки одной коллекции: /collection/{название} + фильтры по персонажам и сетам. */
export default function CollectionDetailPage({
  params,
}: PageProps<"/collection/[slug]">) {
  const { slug } = use(params);
  const collectionName = decodeURIComponent(slug);

  const [collection, setCollection] = useState<CollectionWithCards | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [characterFilter, setCharacterFilter] = useState<string[]>([]);
  const [setFilter, setSetFilter] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [collectionData, charactersData, setsData] = await Promise.all([
        fetchJson<CollectionWithCards>(
          `/api/collections/${encodeURIComponent(collectionName)}`,
        ),
        fetchJson<Character[]>("/api/characters"),
        fetchJson<CardSet[]>("/api/sets"),
      ]);
      setCollection(collectionData);
      setCharacters(charactersData);
      setSets(setsData);
      setNotFound(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error && "status" in err && err.status === 404) {
        setNotFound(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Не удалось загрузить коллекцию");
    }
  }, [collectionName]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleCards = useMemo(() => {
    if (!collection) return null;
    return collection.cards.filter((card) => {
      const byCharacter =
        characterFilter.length === 0 ||
        characterFilter.some((id) => card.characterIds.includes(id));
      const bySet =
        setFilter.length === 0 || (card.setId ? setFilter.includes(card.setId) : false);
      return byCharacter && bySet;
    });
  }, [collection, characterFilter, setFilter]);

  const characterNames = (card: Card) =>
    card.characterIds
      .map((id) => characters.find((character) => character.id === id)?.name)
      .filter((name): name is string => Boolean(name));

  const setNames = (card: Card) => {
    const set = card.setId ? sets.find((item) => item.id === card.setId) : undefined;
    return set?.name;
  };

  if (notFound) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Коллекция не найдена</h1>
        <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Коллекции «{collectionName}» не существует. Возможно, она была удалена или
          в адресе опечатка.
        </p>
        <Button href="/collection">К списку коллекций</Button>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title={collection ? collection.name : "Коллекция"}
        description={
          collection
            ? `В этой коллекции: ${pluralizeCards(collection.cards.length)}`
            : "Карточки выбранной коллекции."
        }
        actions={
          <Link
            href="/collection"
            className="inline-flex h-9 items-center rounded-full border border-zinc-300 bg-white px-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            ← Все коллекции
          </Link>
        }
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

      {collection === null && !error ? (
        <p className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Загружаем коллекцию…
        </p>
      ) : null}

      {collection !== null ? (
        <div className="flex flex-wrap items-center gap-3">
          <CharacterFilter
            options={characters}
            value={characterFilter}
            onChange={setCharacterFilter}
          />
          <CardSetFilter options={sets} value={setFilter} onChange={setSetFilter} />
          {visibleCards ? (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Найдено: {pluralizeCards(visibleCards.length)}
            </span>
          ) : null}
        </div>
      ) : null}

      {collection !== null && collection.cards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            В этой коллекции пока нет карточек. Добавьте карточку на{" "}
            <Link href="/cards" className="underline underline-offset-4">
              странице карточек
            </Link>{" "}
            и отметьте эту коллекцию в форме.
          </p>
        </div>
      ) : null}

      {collection !== null &&
      collection.cards.length > 0 &&
      visibleCards !== null &&
      visibleCards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            По выбранным фильтрам карточек в этой коллекции не найдено.
          </p>
        </div>
      ) : null}

      {visibleCards !== null && visibleCards.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleCards.map((card) => (
            <li key={card.id}>
              <CardTile
                card={card}
                characterBadges={characterNames(card)}
                setBadge={setNames(card)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
