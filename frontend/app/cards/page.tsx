"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Card } from "@/entities/card";
import { CardTile } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { Collection } from "@/entities/collection";
import type { CardSet } from "@/entities/set";
import { AddCardDialog } from "@/features/add-card";
import { CharacterFilter } from "@/features/filter-cards-by-character";
import { CardSetFilter } from "@/features/filter-cards-by-set";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Общий список всех карточек + добавление через попап + фильтры по персонажам и сетам. */
export default function CardsPage() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [characterFilter, setCharacterFilter] = useState<string[]>([]);
  const [setFilter, setSetFilter] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cardsData, collectionsData, charactersData, setsData] = await Promise.all([
        fetchJson<Card[]>("/api/cards"),
        fetchJson<Collection[]>("/api/collections"),
        fetchJson<Character[]>("/api/characters"),
        fetchJson<CardSet[]>("/api/sets"),
      ]);
      setCards(cardsData);
      setCollections(collectionsData);
      setCharacters(charactersData);
      setSets(setsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить карточки");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const collectionNames = (card: Card) =>
    card.collectionIds
      .map((id) => collections.find((collection) => collection.id === id)?.name)
      .filter((name): name is string => Boolean(name));

  const characterNames = (card: Card) =>
    card.characterIds
      .map((id) => characters.find((character) => character.id === id)?.name)
      .filter((name): name is string => Boolean(name));

  const setNames = (card: Card) => {
    const set = card.setId ? sets.find((item) => item.id === card.setId) : undefined;
    return set?.name;
  };

  const visibleCards = useMemo(() => {
    if (!cards) return null;
    return cards.filter((card) => {
      const byCharacter =
        characterFilter.length === 0 ||
        characterFilter.some((id) => card.characterIds.includes(id));
      const bySet =
        setFilter.length === 0 || (card.setId ? setFilter.includes(card.setId) : false);
      return byCharacter && bySet;
    });
  }, [cards, characterFilter, setFilter]);

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title="Карточки"
        description="Общий список всех карточек. Добавляйте новые и отмечайте, в какие коллекции и сеты они входят."
        actions={<AddCardDialog onAdded={() => void load()} />}
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

      {cards === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем карточки…
        </p>
      ) : null}

      {cards !== null ? (
        <div className="flex flex-wrap items-center gap-3">
          <CharacterFilter
            options={characters}
            value={characterFilter}
            onChange={setCharacterFilter}
          />
          <CardSetFilter options={sets} value={setFilter} onChange={setSetFilter} />
          {visibleCards ? (
            <span className="text-sm text-muted">
              Найдено: {pluralizeCards(visibleCards.length)}
            </span>
          ) : null}
        </div>
      ) : null}

      {visibleCards !== null && cards !== null && cards.length === 0 && !error ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            Карточек пока нет. Нажмите «Добавить карточку», чтобы создать первую.
          </p>
        </div>
      ) : null}

      {visibleCards !== null && cards !== null && cards.length > 0 && visibleCards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            По выбранным фильтрам карточек не найдено.
          </p>
        </div>
      ) : null}

      {visibleCards !== null && visibleCards.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleCards.map((card) => (
            <li key={card.id}>
              <CardTile
                card={card}
                badges={collectionNames(card)}
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
