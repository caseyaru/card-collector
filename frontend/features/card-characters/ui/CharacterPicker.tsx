"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Character } from "@/entities/character";
import { cn } from "@/shared/lib/cn";

/** Разбирает ввод через запятую в список уникальных имён. */
export function parseCharacterNames(raw: string): string[] {
  return uniqueNames(raw.split(","));
}

/** Оставляет только непустые имена, убирая дубликаты без учёта регистра. */
function uniqueNames(rawNames: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of rawNames) {
    const name = raw.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }
  return unique;
}

interface CharacterPickerProps {
  /** Справочник: из него берётся выпадающий список. */
  options: Character[];
  /** Выбранные персонажи из справочника. */
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  /** Новые имена, зафиксированные в поле (ещё не созданы на сервере). */
  pendingNames: string[];
  onPendingNamesChange: (names: string[]) => void;
  className?: string;
}

/**
 * Выбор персонажей: существующие выбираются из выпадающего списка,
 * новые имена фиксируются в поле по Enter или запятой и становятся тегами.
 */
export function CharacterPicker({
  options,
  selectedIds,
  onSelectedIdsChange,
  pendingNames,
  onPendingNamesChange,
  className,
}: CharacterPickerProps) {
  const [open, setOpen] = useState(false);
  // Текст, который сейчас набирается (ещё не стал тегом).
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const selected = options.filter((option) => selectedIds.includes(option.id));
  const available = options.filter((option) => !selectedIds.includes(option.id));

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

  function add(id: string) {
    if (!selectedIds.includes(id)) onSelectedIdsChange([...selectedIds, id]);
    setOpen(false);
  }

  function remove(id: string) {
    onSelectedIdsChange(selectedIds.filter((item) => item !== id));
  }

  /** Фиксирует набранный текст как теги новых персонажей. */
  function commitDraft() {
    const names = parseCharacterNames(draft);
    if (names.length === 0) {
      setDraft("");
      return;
    }
    // Не дублируем уже выбранных и уже добавленные в поле персонажей.
    const known = new Set([
      ...selected.map((character) => character.name.toLowerCase()),
      ...pendingNames.map((name) => name.toLowerCase()),
    ]);
    const fresh = names.filter((name) => !known.has(name.toLowerCase()));
    if (fresh.length > 0) {
      onPendingNamesChange(uniqueNames([...pendingNames, ...fresh]));
    }
    setDraft("");
  }

  function removePending(name: string) {
    onPendingNamesChange(pendingNames.filter((item) => item !== name));
  }

  function handleChange(value: string) {
    // Запятая тоже фиксирует имя — можно вводить список «Аня, Борис».
    if (value.includes(",")) {
      const parts = value.split(",");
      const last = parts.pop() ?? "";
      const names = uniqueNames(parts);
      if (names.length > 0) {
        const known = new Set([
          ...selected.map((character) => character.name.toLowerCase()),
          ...pendingNames.map((item) => item.toLowerCase()),
        ]);
        const fresh = names.filter((name) => !known.has(name.toLowerCase()));
        if (fresh.length > 0) {
          onPendingNamesChange(uniqueNames([...pendingNames, ...fresh]));
        }
      }
      setDraft(last);
      return;
    }
    setDraft(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Enter фиксирует имя и не отправляет форму.
      event.preventDefault();
      commitDraft();
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        Персонажи
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
          {selected.map((character) => (
            <span
              key={character.id}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {character.name}
              <button
                type="button"
                aria-label={`Убрать «${character.name}»`}
                onClick={() => remove(character.id)}
                className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </span>
          ))}

          {/* Теги новых имён: создадутся на сервере при сохранении. */}
          {pendingNames.map((name) => (
            <span
              key={name.toLowerCase()}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-400 px-2 py-1 text-sm text-zinc-600 dark:border-zinc-500 dark:text-zinc-300"
            >
              {name}
              <button
                type="button"
                aria-label={`Убрать «${name}»`}
                onClick={() => removePending(name)}
                className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </span>
          ))}

          <input
            id={inputId}
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitDraft}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            placeholder={
              selected.length === 0 && pendingNames.length === 0
                ? "Выберите из списка или введите имя"
                : ""
            }
            className="min-w-40 flex-1 bg-transparent px-1 py-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
        </div>

        {open ? (
          <ul
            role="listbox"
            aria-label="Персонажи"
            className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {available.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                {options.length === 0
                  ? "Персонажей пока нет — введите имя и нажмите Enter."
                  : "Все персонажи уже добавлены."}
              </li>
            ) : (
              available.map((character) => (
                <li key={character.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => add(character.id)}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {character.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Выбрано: {selected.length}
        {pendingNames.length > 0
          ? ` · новых имён: ${pendingNames.length} (создадутся при сохранении)`
          : ""}
      </span>
    </div>
  );
}
