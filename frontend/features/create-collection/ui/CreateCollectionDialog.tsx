"use client";

import { useState, type FormEvent } from "react";
import type { Collection } from "@/entities/collection";
import { postJson } from "@/shared/lib/fetcher";
import { Button, Modal, TextField } from "@/shared/ui";

interface CreateCollectionDialogProps {
  /** Вызывается после успешного создания коллекции. */
  onAdded?: (collection: Collection) => void;
}

/** Кнопка «Создать коллекцию» + попап с формой (название). */
export function CreateCollectionDialog({ onAdded }: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const collection = await postJson<Collection>("/api/collections", { name });
      onAdded?.(collection);
      setOpen(false);
      setName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать коллекцию",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Создать коллекцию</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Новая коллекция">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Название коллекции"
            placeholder="Например: Редкие"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            hint="Название станет адресом: /collection/Название"
          />

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Создаём…" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
