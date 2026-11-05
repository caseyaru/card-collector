"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import type { Card } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { Collection } from "@/entities/collection";
import type { CardSet } from "@/entities/set";
import { CharacterPicker } from "@/features/card-characters";
import { CardSetPicker } from "@/features/card-set";
import { fetchJson, postJson } from "@/shared/lib/fetcher";
import { Button, Modal, StarRating, TagMultiSelect, TextField } from "@/shared/ui";

interface AddCardDialogProps {
  /** Вызывается после успешного создания карточки. */
  onAdded?: (card: Card) => void;
}

/** Кнопка «Добавить карточку» + попап с формой (название, картинка, коллекции, персонажи). */
export function AddCardDialog({ onAdded }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Ссылка, подтянутая в превью (обновляется при выходе поля из фокуса).
  const [imagePreview, setImagePreview] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [setId, setSetId] = useState("");
  const [pendingSetName, setPendingSetName] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    Promise.all([
      fetchJson<Collection[]>("/api/collections"),
      fetchJson<Character[]>("/api/characters"),
      fetchJson<CardSet[]>("/api/sets"),
    ])
      .then(([collectionsData, charactersData, setsData]) => {
        if (cancelled) return;
        setCollections(collectionsData);
        setCharacters(charactersData);
        setSets(setsData);
      })
      .catch(() => {
        if (cancelled) return;
        setCollections([]);
        setCharacters([]);
        setSets([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  /** Подтягивает ссылку из поля в превью при потере фокуса. */
  function commitImagePreview() {
    setImagePreview(imageUrl.trim());
    setPreviewFailed(false);
  }

  // next/image принимает только абсолютный http(s)-адрес; остальное — как «нет картинки».
  const previewSource = /^https?:\/\//i.test(imagePreview) ? imagePreview : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const card = await postJson<Card>("/api/cards", {
        name,
        imageUrl,
        rating,
        collectionIds: selectedIds,
        characterIds,
        characterNames,
        setId,
        setName: setId ? undefined : pendingSetName,
      });
      onAdded?.(card);
      setOpen(false);
      setName("");
      setImageUrl("");
      setImagePreview("");
      setPreviewFailed(false);
      setSelectedIds([]);
      setCharacterIds([]);
      setCharacterNames([]);
      setSetId("");
      setPendingSetName("");
      setRating(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось добавить карточку");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Добавить карточку</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Новая карточка">
        <form
          onSubmit={handleSubmit}
          onKeyDown={(event) => {
            // Enter в полях не должен отправлять форму: сохранение — только кнопкой.
            if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
              event.preventDefault();
            }
          }}
          className="flex flex-col gap-4"
        >
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
            onBlur={commitImagePreview}
            hint="Необязательно. Если ссылки нет, карточка покажет заглушку."
          />

          {/* Превью картинки: подтягивается, когда поле выходит из фокуса. */}
          {previewSource && !previewFailed ? (
            <div className="relative aspect-[5/7] w-32 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
              <Image
                src={previewSource}
                alt="Превью карточки"
                fill
                sizes="128px"
                className="object-cover"
                onError={() => setPreviewFailed(true)}
              />
            </div>
          ) : imagePreview ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Не удалось загрузить изображение по этой ссылке.
            </p>
          ) : null}

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

          <CardSetPicker
            options={sets}
            selectedId={setId}
            onSelectedIdChange={setSetId}
            pendingName={pendingSetName}
            onPendingNameChange={setPendingSetName}
          />

          <StarRating value={rating} onChange={setRating} editable />

          {error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Добавляем…" : "Добавить"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
