"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { CardSet } from "@/entities/set";
import { cn } from "@/shared/lib/cn";

interface CardSetPickerProps {
  /** Справочник сетов: из него берётся выпадающий список. */
  options: CardSet[];
  /** Выбранный сет из справочника (id) или пустая строка. */
  selectedId: string;
  onSelectedIdChange: (id: string) => void;
  /** Введённое пользователем новое название сета (ещё не создано на сервере). */
  pendingName: string;
  onPendingNameChange: (name: string) => void;
  className?: string;
}

/**
 * Выбор сета: у карточки не более одного. Существующий выбирается из списка,
 * новое название фиксируется по Enter и создаётся на сервере при сохранении.
 */
export function CardSetPicker({
  options,
  selectedId,
  onSelectedIdChange,
  pendingName,
  onPendingNameChange,
  className,
}: CardSetPickerProps) {
  const [open, setOpen] = useState(false);
  // Текст, который сейчас набирается (ещё не стал тегом).
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const selected = options.find((option) => option.id === selectedId) ?? null;

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(id: string) {
    onSelectedIdChange(id);
    onPendingNameChange("");
    setDraft("");
    setOpen(false);
  }

  function clear() {
    onSelectedIdChange("");
    onPendingNameChange("");
    setDraft("");
  }

  /** Фиксирует набранный текст как название нового сета. */
  function commitDraft() {
    const name = draft.trim();
    if (!name) return;

    // Если такое название уже есть в справочнике — просто выбираем его.
    const existing = options.find(
      (option) => option.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      choose(existing.id);
      return;
    }

    onSelectedIdChange("");
    onPendingNameChange(name);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Enter фиксирует название и не отправляет форму.
      event.preventDefault();
      commitDraft();
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        Сет
      </label>

      {/* ref на обёртке (поле + список), чтобы клик по опции не считался внешним. */}
      <div className="relative" ref={containerRef}>
        <div
          className={cn(
            "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5 transition-colors dark:bg-zinc-950",
            open
              ? "border-zinc-500"
              : "border-zinc-300 focus-within:border-zinc-500 dark:border-zinc-700",
          )}
        >
          {selected ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
              {selected.name}
              <button
                type="button"
                aria-label={`Убрать «${selected.name}»`}
                onClick={clear}
                className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </span>
          ) : null}

          {/* Тег нового названия: создастся на сервере при сохранении. */}
          {!selected && pendingName ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-400 px-2 py-1 text-sm text-zinc-600 dark:border-zinc-500 dark:text-zinc-300">
              {pendingName}
              <button
                type="button"
                aria-label={`Убрать «${pendingName}»`}
                onClick={() => onPendingNameChange("")}
                className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </span>
          ) : null}

          <input
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitDraft}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            disabled={Boolean(selected) || Boolean(pendingName)}
            placeholder={
              selected || pendingName
                ? ""
                : "Выберите из списка или введите название"
            }
            className="min-w-40 flex-1 bg-transparent px-1 py-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:text-zinc-100"
          />
        </div>

        {open && !selected && !pendingName ? (
          <ul
            role="listbox"
            aria-label="Сеты"
            className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                Сетов пока нет — введите название и нажмите Enter.
              </li>
            ) : (
              <>
                {options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => choose(option.id)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {option.name}
                    </button>
                  </li>
                ))}
                <li className="border-t border-zinc-100 px-3 py-2 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                  Или введите новое название и нажмите Enter.
                </li>
              </>
            )}
          </ul>
        ) : null}
      </div>

      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Необязательно. У карточки может быть только один сет.
      </span>
    </div>
  );
}
