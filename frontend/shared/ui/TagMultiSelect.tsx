"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";

export interface TagMultiSelectOption {
  id: string;
  name: string;
}

interface TagMultiSelectProps {
  label: string;
  /** Доступные варианты (весь список коллекций). */
  options: TagMultiSelectOption[];
  /** Выбранные id. */
  value: string[];
  onChange: (value: string[]) => void;
  /** Текст-подсказка, когда ничего не выбрано. */
  placeholder?: string;
  className?: string;
}

/**
 * Мультивыбор в виде строки с тегами.
 * Клик по полю открывает выпадающий список, выбор схлопывает список
 * и добавляет тег; тег удаляется крестиком.
 */
export function TagMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Выберите из списка",
  className,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.filter((option) => value.includes(option.id));
  const available = options.filter((option) => !value.includes(option.id));

  // Закрытие по клику вне поля и по Escape.
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

  function toggleOpen() {
    setOpen((current) => !current);
  }

  function add(id: string) {
    if (!value.includes(id)) onChange([...value, id]);
    setOpen(false);
  }

  function remove(id: string) {
    onChange(value.filter((item) => item !== id));
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>

      {/* ref на обёртке (поле + выпадающий список), чтобы клик по опции
          списка не считался кликом вне компонента. */}
      <div className="relative" ref={containerRef}>
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={toggleOpen}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleOpen();
            }
          }}
          className={cn(
            "flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5 outline-none transition-colors",
            open
              ? "border-brand-pink"
              : "border-line-strong focus:border-brand-pink",
          )}
        >
          {selected.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-lilac/35 px-2 py-1 text-sm text-ink-soft"
            >
              {option.name}
              <button
                type="button"
                aria-label={`Убрать «${option.name}»`}
                onClick={(event) => {
                  event.stopPropagation();
                  remove(option.id);
                }}
                className="rounded-full p-0.5 text-faint transition-colors hover:bg-brand-pink/15 hover:text-brand-pink-deep"
              >
                ✕
              </button>
            </span>
          ))}

          {selected.length === 0 ? (
            <span className="px-1 text-sm text-faint">
              {placeholder}
            </span>
          ) : null}
        </div>

        {open ? (
          <ul
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg"
          >
            {available.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">
                {options.length === 0
                  ? "Коллекций пока нет — создайте их на странице «Коллекции»."
                  : "Все коллекции уже добавлены."}
              </li>
            ) : (
              available.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => add(option.id)}
                    className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-lilac-soft"
                  >
                    {option.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      <span className="text-xs text-muted">
        Коллекций выбрано: {selected.length}
      </span>
    </div>
  );
}
