"use client";

import { useState, type FormEvent } from "react";
import type { CardSet } from "@/entities/set";
import { postJson } from "@/shared/lib/fetcher";
import { Button, Modal, TextField } from "@/shared/ui";

interface CreateSetDialogProps {
  /** Вызывается после успешного создания сета. */
  onAdded?: (set: CardSet) => void;
}

/** Кнопка «Создать сет» + попап с формой (название). */
export function CreateSetDialog({ onAdded }: CreateSetDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const set = await postJson<CardSet>("/api/sets", { name });
      onAdded?.(set);
      setOpen(false);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать сет");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Создать сет</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Новый сет">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Название сета"
            placeholder="Например: Пламя и лёд"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            hint="Название станет адресом: /sets/Название"
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
