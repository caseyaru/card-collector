"use client";

import { useEffect, useRef, useState } from "react";
import type { CardSet } from "@/entities/set";
import { cn } from "@/shared/lib/cn";

interface CardSetFilterProps {
  /** Все сеты справочника. */
  options: CardSet[];
  /** Выбранные для фильтра id. Пусто — без фильтра. */
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

/** Фильтр карточек по сетам: мультивыбор из справочника. */
export function CardSetFilter({
  options,
  value,
  onChange,
  className,
}: CardSetFilterProps) {
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
            "flex min-h-9 w-64 cursor-pointer flex-wrap items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm outline-none transition-colors",
            open
              ? "border-brand-pink"
              : "border-line-strong focus:border-brand-pink",
          )}
        >
          {selected.length === 0 ? (
            <span className="text-muted">Все сеты</span>
          ) : (
            selected.map((set) => (
              <span
                key={set.id}
                className="inline-flex items-center gap-1 rounded-full bg-brand-lilac/40 px-2 py-0.5 text-xs text-ink"
              >
                {set.name}
                <button
                  type="button"
                  aria-label={`Убрать «${set.name}» из фильтра`}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(set.id);
                  }}
                  className="rounded-full p-0.5 text-faint transition-colors hover:bg-brand-pink/15 hover:text-brand-pink-deep"
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
            aria-label="Сеты"
            className="absolute left-0 z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg"
          >
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-lilac-soft"
              >
                Все сеты
              </button>
            </li>

            {available.length === 0 && options.length > 0 ? (
              <li className="px-3 py-2 text-sm text-muted">
                Все сеты уже выбраны.
              </li>
            ) : null}

            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">
                Сетов пока нет.
              </li>
            ) : null}

            {available.map((set) => (
              <li key={set.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => add(set.id)}
                  className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-lilac-soft"
                >
                  {set.name}
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
          className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink-soft"
        >
          Сбросить
        </button>
      ) : null}
    </div>
  );
}
