"use client";

import { useState, type FormEvent } from "react";
import type { Character } from "@/entities/character";
import { postJson } from "@/shared/lib/fetcher";
import { Button, Modal, TextField } from "@/shared/ui";

interface CreateCharacterDialogProps {
  /** Вызывается после успешного создания персонажа. */
  onAdded?: (character: Character) => void;
}

/** Кнопка «Создать персонажа» + попап с формой (имя). */
export function CreateCharacterDialog({ onAdded }: CreateCharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const character = await postJson<Character>("/api/characters", { name });
      onAdded?.(character);
      setOpen(false);
      setName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать персонажа",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Создать персонажа
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Новый персонаж">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Имя персонажа"
            placeholder="Например: Эмбера"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            hint="Имя станет адресом: /characters/Имя"
          />

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={pending || !name.trim()}>
              {pending ? "Создаём…" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
