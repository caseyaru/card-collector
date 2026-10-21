"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Card } from "@/entities/card";
import type { Character } from "@/entities/character";
import type { Collection } from "@/entities/collection";
import { CharacterPicker } from "@/features/card-characters";
import { fetchJson, postJson } from "@/shared/lib/fetcher";
import { Button, Modal, TagMultiSelect, TextField } from "@/shared/ui";

interface AddCardDialogProps {
  /** Вызывается после успешного создания карточки. */
  onAdded?: (card: Card) => void;
}

/** Кнопка «Добавить карточку» + попап с формой (название, картинка, коллекции, персонажи). */
export function AddCardDialog({ onAdded }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    Promise.all([
      fetchJson<Collection[]>("/api/collections"),
      fetchJson<Character[]>("/api/characters"),
    ])
      .then(([collectionsData, charactersData]) => {
        if (cancelled) return;
        setCollections(collectionsData);
        setCharacters(charactersData);
      })
      .catch(() => {
        if (cancelled) return;
        setCollections([]);
        setCharacters([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const card = await postJson<Card>("/api/cards", {
        name,
        imageUrl,
        collectionIds: selectedIds,
        characterIds,
        characterNames,
      });
      onAdded?.(card);
      setOpen(false);
      setName("");
      setImageUrl("");
      setSelectedIds([]);
      setCharacterIds([]);
      setCharacterNames([]);
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
