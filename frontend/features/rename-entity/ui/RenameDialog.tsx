"use client";

import { useState, type FormEvent } from "react";
import { Button, Modal, TextField } from "@/shared/ui";

interface RenameDialogProps {
  /** Заголовок попапа. */
  title: string;
  /** Подпись поля ввода. */
  label: string;
  placeholder: string;
  /** Текущее название — подставляется при каждом открытии. */
  currentName: string;
  hint?: string;
  /** Сохраняет новое название. Ошибка показывается внутри попапа. */
  onRename: (name: string) => Promise<void>;
}

/** Кнопка «Переименовать» + попап с формой названия. */
export function RenameDialog({
  title,
  label,
  placeholder,
  currentName,
  hint,
  onRename,
}: RenameDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function openDialog() {
    setName(currentName);
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await onRename(name.trim());
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось переименовать");
    } finally {
      setPending(false);
    }
  }

  function close() {
    if (pending) return;
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={openDialog}>
        Переименовать
      </Button>

      <Modal open={open} onClose={close} title={title}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label={label}
            placeholder={placeholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            hint={hint}
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
              onClick={close}
              disabled={pending}
            >
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={pending || !name.trim()}>
              {pending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
