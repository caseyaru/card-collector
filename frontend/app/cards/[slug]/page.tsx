"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Card } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { Collection } from "@/entities/collection";
import type { CardSet } from "@/entities/set";
import { CharacterPicker } from "@/features/card-characters";
import { CardSetPicker } from "@/features/card-set";
import { ApiError, fetchJson } from "@/shared/lib/fetcher";
import { Button, Container, StarRating, TagMultiSelect, TextField } from "@/shared/ui";

/** Страница карточки: /cards/{название}. Слева изображение, справа информация и действия. */
export default function CardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cardName = decodeURIComponent(slug);
  const router = useRouter();

  const [card, setCard] = useState<Card | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Режим редактирования.
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Ссылка, подтянутая в контейнер-превью (обновляется при выходе поля из фокуса).
  const [imagePreview, setImagePreview] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [setId, setSetId] = useState("");
  const [pendingSetName, setPendingSetName] = useState("");
  const [rating, setRating] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Удаление с подтверждением в два клика.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cardData, collectionsData, charactersData, setsData] = await Promise.all([
        fetchJson<Card>(`/api/cards/${encodeURIComponent(cardName)}`),
        fetchJson<Collection[]>("/api/collections"),
        fetchJson<Character[]>("/api/characters"),
        fetchJson<CardSet[]>("/api/sets"),
      ]);
      setCard(cardData);
      setCollections(collectionsData);
      setCharacters(charactersData);
      setSets(setsData);
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

  /** Перечитывает справочник сетов (после сохранения мог появиться новый). */
  const refreshSets = useCallback(async () => {
    try {
      setSets(await fetchJson<CardSet[]>("/api/sets"));
    } catch {
      // Не критично: названия подтянутся при следующей загрузке страницы.
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

  /** Сет карточки, если задан. */
  const cardSet = card?.setId
    ? (sets.find((set) => set.id === card.setId) ?? null)
    : null;

  /** Ссылка для контейнера-изображения: в редактировании — превью из поля. */
  const previewSource = editing ? imagePreview : (card?.imageUrl ?? "");
  // next/image принимает только абсолютный http(s)-адрес; остальное — как «нет картинки».
  const shownImageUrl = /^https?:\/\//i.test(previewSource) ? previewSource : "";

  function startEdit() {
    if (!card) return;
    setName(card.name);
    setImageUrl(card.imageUrl ?? "");
    setImagePreview(card.imageUrl ?? "");
    setPreviewFailed(false);
    setSelectedIds(card.collectionIds);
    setCharacterIds(card.characterIds);
    setCharacterNames([]);
    setSetId(card.setId ?? "");
    setPendingSetName("");
    setRating(card.rating ?? 0);
    setFormError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setFormError(null);
  }

  /**
   * Подтягивает ссылку из поля в контейнер-превью. Вызывается при выходе
   * поля из фокуса — до этого момента набор текста превью не трогает.
   */
  function commitImagePreview() {
    const url = imageUrl.trim();
    setImagePreview(url);
    setPreviewFailed(false);
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
            rating,
            collectionIds: selectedIds,
            characterIds,
            characterNames,
            // Сет необязателен: выбранный из справочника, новое название или пусто
            // (пустая строка явно означает «убрать сет»).
            setId,
            setName: setId ? undefined : pendingSetName,
          }),
        },
      );
      setCard(updated);
      setEditing(false);
      setCharacterNames([]);
      setPendingSetName("");
      // Новые персонажи и сеты создаются на сервере, поэтому обновляем
      // справочники, иначе их названия не отобразятся до перезагрузки страницы.
      void refreshCharacters();
      void refreshSets();
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
        <p className="max-w-md text-sm leading-6 text-muted">
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
        className="inline-flex h-9 w-fit items-center rounded-full border border-line-strong bg-white px-3 text-sm transition-colors hover:border-brand-pink/40 hover:bg-lilac-soft"
      >
        ← Все карточки
      </Link>

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

      {card === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем карточку…
        </p>
      ) : null}

      {card !== null ? (
        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
          {/* Слева: изображение. В режиме редактирования показывает превью
              ссылки, подтянутой из поля (обновляется при потере фокуса). */}
          <div className="relative aspect-[5/7] w-full overflow-hidden rounded-2xl border border-line bg-lilac-soft">
            {shownImageUrl && !previewFailed ? (
              <Image
                src={shownImageUrl}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                onError={() => {
                  if (editing) setPreviewFailed(true);
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-faint">
                {editing && imagePreview
                  ? "Не удалось загрузить изображение"
                  : "Нет изображения"}
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
                placeholder="https://example.com"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                onBlur={commitImagePreview}
                hint="Необязательно. Если ссылки нет, карточка покажет заглушку."
              />

              <TagMultiSelect
                label="Коллекции"
                options={collections}
                value={selectedIds}
                onChange={setSelectedIds}
                placeholder="Добавить в коллекции"
              />

              <CardSetPicker
                options={sets}
                selectedId={setId}
                onSelectedIdChange={setSetId}
                pendingName={pendingSetName}
                onPendingNameChange={setPendingSetName}
              />

              <CharacterPicker
                options={characters}
                selectedIds={characterIds}
                onSelectedIdsChange={setCharacterIds}
                pendingNames={characterNames}
                onPendingNamesChange={setCharacterNames}
              />

              <StarRating value={rating} onChange={setRating} editable />

              {formError ? (
                <p role="alert" className="text-sm text-red-600">
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
                <span className="text-sm font-medium text-muted">
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
                            className="inline-flex rounded-full bg-brand-lilac/35 px-3 py-1 text-sm text-ink-soft transition-colors hover:bg-brand-lilac/55"
                          >
                            {collection.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">
                    Карточка пока не состоит в коллекциях.
                  </p>
                )}
              </div>

              {/* Сет необязателен: если не задан — блок не показываем. */}
              {cardSet ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted">
                    Сет
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    <li>
                      <Link
                        href={`/sets/${encodeURIComponent(cardSet.name)}`}
                        className="inline-flex rounded-full bg-brand-blue/15 px-3 py-1 text-sm text-brand-blue-deep transition-colors hover:bg-brand-blue/25"
                      >
                        {cardSet.name}
                      </Link>
                    </li>
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted">
                  Персонажи
                </span>
                {cardCharacters.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {cardCharacters.map((character) => (
                      <li
                        key={character.id}
                        className="inline-flex rounded-full bg-brand-yellow-soft px-3 py-1 text-sm text-ink-soft"
                      >
                        {character.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">
                    У карточки пока нет персонажей.
                  </p>
                )}
              </div>

              <StarRating value={card.rating} label="Рейтинг" />

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
