"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CardTile, type Card } from "@/entities/card";
import type { Character, CharacterWithCards } from "@/entities/character";
import type { Collection } from "@/entities/collection";
import type { CardSet } from "@/entities/set";
import { RenameDialog } from "@/features/rename-entity";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Карточки одного персонажа: /characters/{имя}. */
export default function CharacterDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const characterName = decodeURIComponent(slug);
  const router = useRouter();

  const [character, setCharacter] = useState<CharacterWithCards | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [characterData, charactersData, collectionsData, setsData] =
        await Promise.all([
          fetchJson<CharacterWithCards>(
            `/api/characters/${encodeURIComponent(characterName)}`,
          ),
          fetchJson<Character[]>("/api/characters"),
          fetchJson<Collection[]>("/api/collections"),
          fetchJson<CardSet[]>("/api/sets"),
        ]);
      setCharacter(characterData);
      setCharacters(charactersData);
      setCollections(collectionsData);
      setSets(setsData);
      setNotFound(false);
      setError(null);
    } catch (err) {
      if (err instanceof Error && "status" in err && err.status === 404) {
        setNotFound(true);
        return;
      }
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить персонажа",
      );
    }
  }, [characterName]);

  useEffect(() => {
    void load();
  }, [load]);

  const characterNames = (card: Card) =>
    card.characterIds
      .map((id) => characters.find((item) => item.id === id)?.name)
      .filter((name): name is string => Boolean(name));

  const collectionNames = (card: Card) =>
    card.collectionIds
      .map((id) => collections.find((item) => item.id === id)?.name)
      .filter((name): name is string => Boolean(name));

  const setNames = (card: Card) => {
    const set = card.setId
      ? sets.find((item) => item.id === card.setId)
      : undefined;
    return set?.name;
  };

  async function handleRename(name: string) {
    if (!character) return;

    const updated = await fetchJson<Character>(
      `/api/characters/${character.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ name }),
      },
    );
    setCharacter({ ...character, name: updated.name });
    router.replace(`/characters/${encodeURIComponent(updated.name)}`);
  }

  async function handleDelete() {
    if (!character) return;

    setDeleting(true);
    setError(null);

    try {
      await fetchJson(`/api/characters/${character.id}`, { method: "DELETE" });
      router.push("/characters");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить персонажа",
      );
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (notFound) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Персонаж не найден</h1>
        <p className="max-w-md text-sm leading-6 text-muted">
          Персонажа «{characterName}» не существует. Возможно, он был удалён или
          в адресе опечатка.
        </p>
        <Button href="/characters">К списку персонажей</Button>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title={character ? character.name : "Персонаж"}
        description={
          character
            ? `В карточках этого персонажа: ${pluralizeCards(character.cards.length)}`
            : "Карточки выбранного персонажа."
        }
        actions={
          character ? (
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
                  href="/characters"
                  className="inline-flex h-9 items-center rounded-full border border-line-strong bg-white px-3 text-sm transition-colors hover:border-brand-pink/40 hover:bg-lilac-soft"
                >
                  ← Все персонажи
                </Link>
                <RenameDialog
                  title="Переименовать персонажа"
                  label="Имя персонажа"
                  placeholder="Например: Эмбера"
                  currentName={character.name}
                  hint="Имя станет адресом: /characters/Имя"
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
              href="/characters"
              className="inline-flex h-9 items-center rounded-full border border-line-strong bg-white px-3 text-sm transition-colors hover:border-brand-pink/40 hover:bg-lilac-soft"
            >
              ← Все персонажи
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

      {character === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем персонажа…
        </p>
      ) : null}

      {character !== null && character.cards.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            У этого персонажа пока нет карточек. Добавьте карточку на{" "}
            <Link href="/cards" className="underline underline-offset-4">
              странице карточек
            </Link>{" "}
            и отметьте этого персонажа в форме.
          </p>
        </div>
      ) : null}

      {character !== null && character.cards.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {character.cards.map((card) => (
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
