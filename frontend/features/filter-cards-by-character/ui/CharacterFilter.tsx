"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/entities/character";
import { cn } from "@/shared/lib/cn";

interface CharacterFilterProps {
  /** Все персонажи справочника (без возможности добавить нового). */
  options: Character[];
  /** Выбранные для фильтра id. Пусто — без фильтра. */
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

/** Фильтр карточек по персонажам: мультивыбор из справочника. */
export function CharacterFilter({
  options,
  value,
  onChange,
  className,
}: CharacterFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.filter((option) => value.includes(option.id));
  const available = options.filter((option) => !value.includes(option.id));

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
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
    if (!value.includes(id)) onChange([...value, id]);
    setOpen(false);
  }

  function remove(id: string) {
    onChange(value.filter((item) => item !== id));
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative" ref={containerRef}>
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
          className={cn(
            "flex min-h-9 w-64 cursor-pointer flex-wrap items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm outline-none transition-colors dark:bg-zinc-900",
            open
              ? "border-zinc-500"
              : "border-zinc-300 focus:border-zinc-500 dark:border-zinc-700",
          )}
        >
          {selected.length === 0 ? (
            <span className="text-zinc-500 dark:text-zinc-400">Все персонажи</span>
          ) : (
            selected.map((character) => (
              <span
                key={character.id}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {character.name}
                <button
                  type="button"
                  aria-label={`Убрать «${character.name}» из фильтра`}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(character.id);
                  }}
                  className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>

        {open ? (
          <ul
            role="listbox"
            aria-label="Персонажи"
            className="absolute left-0 z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Все персонажи
              </button>
            </li>

            {available.length === 0 && options.length > 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                Все персонажи уже выбраны.
              </li>
            ) : null}

            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                Персонажей пока нет.
              </li>
            ) : null}

            {available.map((character) => (
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
            ))}
          </ul>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-sm text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Сбросить
        </button>
      ) : null}
    </div>
  );
}
