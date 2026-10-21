"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState, type FormEvent } from "react";
import type { Card } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { Collection } from "@/entities/collection";
import { CharacterPicker } from "@/features/card-characters";
import { ApiError, fetchJson } from "@/shared/lib/fetcher";
import { Button, Container, TagMultiSelect, TextField } from "@/shared/ui";

/** Страница карточки: /cards/{название}. Слева изображение, справа информация и действия. */
export default function CardDetailPage({
  params,
}: PageProps<"/cards/[slug]">) {
  const { slug } = use(params);
  const cardName = decodeURIComponent(slug);
  const router = useRouter();

  const [card, setCard] = useState<Card | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Режим редактирования.
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Удаление с подтверждением в два клика.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cardData, collectionsData, charactersData] = await Promise.all([
        fetchJson<Card>(`/api/cards/${encodeURIComponent(cardName)}`),
        fetchJson<Collection[]>("/api/collections"),
        fetchJson<Character[]>("/api/characters"),
      ]);
      setCard(cardData);
      setCollections(collectionsData);
      setCharacters(charactersData);
      setNotFound(false);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Не удалось загрузить карточку");
    }
  }, [cardName]);

  /** Перечитывает справочник персонажей (после сохранения могли появиться новые). */
  const refreshCharacters = useCallback(async () => {
    try {
      setCharacters(await fetchJson<Character[]>("/api/characters"));
    } catch {
      // Не критично: имена подтянутся при следующей загрузке страницы.
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Персонажи карточки в порядке их идентификаторов. */
  const cardCharacters = card
    ? card.characterIds
        .map((id) => characters.find((character) => character.id === id))
        .filter((character): character is Character => Boolean(character))
    : [];

  function startEdit() {
    if (!card) return;
    setName(card.name);
    setImageUrl(card.imageUrl ?? "");
    setSelectedIds(card.collectionIds);
    setCharacterIds(card.characterIds);
    setCharacterNames([]);
    setFormError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setFormError(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    try {
      const updated = await fetchJson<Card>(
        `/api/cards/${encodeURIComponent(cardName)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            imageUrl,
            collectionIds: selectedIds,
            characterIds,
            characterNames,
          }),
        },
      );
      setCard(updated);
      setEditing(false);
      setCharacterNames([]);
      // Новые персонажи создаются на сервере, поэтому обновляем справочник,
      // иначе их имена не отобразятся до перезагрузки страницы.
      void refreshCharacters();
      // Название изменилось — страница должна перейти на новый адрес.
      if (updated.name !== cardName) {
        router.replace(`/cards/${encodeURIComponent(updated.name)}`);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Не удалось сохранить карточку");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      await fetchJson(`/api/cards/${encodeURIComponent(cardName)}`, {
        method: "DELETE",
      });
      router.push("/cards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить карточку");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (notFound) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Карточка не найдена</h1>
        <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Карточки «{cardName}» не существует. Возможно, она была удалена или
          в адресе опечатка.
        </p>
        <Button href="/cards">К списку карточек</Button>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <Link
        href="/cards"
        className="inline-flex h-9 w-fit items-center rounded-full border border-zinc-300 bg-white px-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        ← Все карточки
      </Link>

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

      {card === null && !error ? (
        <p className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Загружаем карточку…
        </p>
      ) : null}

      {card !== null ? (
        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
          {/* Слева: изображение. */}
          <div className="relative aspect-[5/7] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
            {card.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Нет изображения
              </div>
            )}
          </div>

          {/* Справа: информация или форма редактирования. */}
          {editing ? (
            <form
              onSubmit={handleSave}
              onKeyDown={(event) => {
                // Enter в полях не должен отправлять форму: сохранение — только кнопкой.
                if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
                  event.preventDefault();
                }
              }}
              className="flex flex-col gap-4"
            >
              <h1 className="text-3xl font-semibold leading-tight">Редактирование</h1>

              <TextField
                label="Название"
                placeholder="Например: Пламенный дракон"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoFocus
              />

              <TextField
                label="Ссылка на изображение"
                type="url"
                inputMode="url"
                placeholder="https://example.com/card.png"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                hint="Необязательно. Если ссылки нет, карточка покажет заглушку."
              />

              <TagMultiSelect
                label="Коллекции"
                options={collections}
                value={selectedIds}
                onChange={setSelectedIds}
                placeholder="Добавить в коллекции"
              />

              <CharacterPicker
                options={characters}
                selectedIds={characterIds}
                onSelectedIdsChange={setCharacterIds}
                pendingNames={characterNames}
                onPendingNamesChange={setCharacterNames}
              />

              {formError ? (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {formError}
                </p>
              ) : null}

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={pending}
                >
                  Отмена
                </Button>
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "Сохраняем…" : "Сохранить"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              <h1 className="text-3xl font-semibold leading-tight">{card.name}</h1>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Коллекции
                </span>
                {card.collectionIds.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {card.collectionIds.map((collectionId) => {
                      const collection = collections.find(
                        (item) => item.id === collectionId,
                      );
                      if (!collection) return null;
                      return (
                        <li key={collectionId}>
                          <Link
                            href={`/collection/${encodeURIComponent(collection.name)}`}
                            className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                          >
                            {collection.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Карточка пока не состоит в коллекциях.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Персонажи
                </span>
                {cardCharacters.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {cardCharacters.map((character) => (
                      <li
                        key={character.id}
                        className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        {character.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    У карточки пока нет персонажей.
                  </p>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={startEdit}>
                  Редактировать
                </Button>

                {confirmingDelete ? (
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
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Удалить
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Container>
  );
}
