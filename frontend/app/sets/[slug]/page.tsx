"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CardTile, type Card } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { CardSet, CardSetWithCards } from "@/entities/set";
import { CharacterFilter } from "@/features/filter-cards-by-character";
import { RenameDialog } from "@/features/rename-entity";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Карточки одного сета: /sets/{название} + фильтр по персонажам. */
export default function SetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const setName = decodeURIComponent(slug);
  const router = useRouter();

  const [cardSet, setCardSet] = useState<CardSetWithCards | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterFilter, setCharacterFilter] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [setData, charactersData] = await Promise.all([
        fetchJson<CardSetWithCards>(`/api/sets/${encodeURIComponent(setName)}`),
        fetchJson<Character[]>("/api/characters"),
      ]);
      setCardSet(setData);
      setCharacters(charactersData);
      setNotFound(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error && "status" in err && err.status === 404) {
        setNotFound(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Не удалось загрузить сет");
    }
  }, [setName]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleCards = useMemo(() => {
    if (!cardSet) return null;
    if (characterFilter.length === 0) return cardSet.cards;
    return cardSet.cards.filter((card) =>
      characterFilter.some((id) => card.characterIds.includes(id)),
    );
  }, [cardSet, characterFilter]);

  const characterNames = (card: Card) =>
    card.characterIds
      .map((id) => characters.find((character) => character.id === id)?.name)
      .filter((name): name is string => Boolean(name));

  async function handleRename(name: string) {
    if (!cardSet) return;

    const updated = await fetchJson<CardSet>(`/api/sets/${cardSet.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    setCardSet({ ...cardSet, name: updated.name });
    router.replace(`/sets/${encodeURIComponent(updated.name)}`);
  }

  async function handleDelete() {
    if (!cardSet) return;

    setDeleting(true);
    setError(null);

    try {
      await fetchJson(`/api/sets/${cardSet.id}`, { method: "DELETE" });
      router.push("/sets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить сет");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (notFound) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Сет не найден</h1>
        <p className="max-w-md text-sm leading-6 text-muted">
          Сета «{setName}» не существует. Возможно, он был удалён или в адресе
          опечатка.
        </p>
        <Button href="/sets">К списку сетов</Button>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title={cardSet ? cardSet.name : "Сет"}
        description={
          cardSet
            ? `В этом сете: ${pluralizeCards(cardSet.cards.length)}`
            : "Карточки выбранного сета."
        }
        actions={
          cardSet ? (
            confirmingDelete ? (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                >
                  {deleting ? "Удаляем…" : "Точно удалить?"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                >
                  Отмена
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/sets"
                  className="inline-flex h-9 items-center rounded-full border border-line-strong bg-white px-3 text-sm transition-colors hover:border-brand-pink/40 hover:bg-lilac-soft"
                >
                  ← Все сеты
                </Link>
                <RenameDialog
                  title="Переименовать сет"
                  label="Название сета"
                  placeholder="Например: Пламя и лёд"
                  currentName={cardSet.name}
                  hint="Название станет адресом: /sets/Название"
                  onRename={handleRename}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Удалить
                </Button>
              </>
            )
          ) : (
            <Link
              href="/sets"
              className="inline-flex h-9 items-center rounded-full border border-line-strong bg-white px-3 text-sm transition-colors hover:border-brand-pink/40 hover:bg-lilac-soft"
            >
              ← Все сеты
            </Link>
          )
        }
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

      {cardSet === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем сет…
        </p>
      ) : null}

      {cardSet !== null ? (
        <div className="flex flex-wrap items-center gap-3">
          <CharacterFilter
            options={characters}
            value={characterFilter}
            onChange={setCharacterFilter}
          />
          {visibleCards ? (
            <span className="text-sm text-muted">
              Найдено: {pluralizeCards(visibleCards.length)}
            </span>
          ) : null}
        </div>
      ) : null}

      {cardSet !== null && cardSet.cards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            В этом сете пока нет карточек. Добавьте карточку на{" "}
            <Link href="/cards" className="underline underline-offset-4">
              странице карточек
            </Link>{" "}
            и выберите этот сет в форме.
          </p>
        </div>
      ) : null}

      {cardSet !== null &&
      cardSet.cards.length > 0 &&
      visibleCards !== null &&
      visibleCards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            По выбранным персонажам карточек в этом сете не найдено.
          </p>
        </div>
      ) : null}

      {visibleCards !== null && visibleCards.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleCards.map((card) => (
            <li key={card.id}>
              <CardTile card={card} characterBadges={characterNames(card)} />
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
