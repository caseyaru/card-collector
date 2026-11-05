"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";

const MAX_RATING = 5;

interface StarRatingProps {
  /** Текущая оценка (0–5); 0 означает «не оценено». */
  value: number;
  /** Подпись над звёздами. */
  label?: string;
  /** Режим выбора: звёзды кликабельны, повторный клик снимает оценку до 0. */
  editable?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Рейтинг в виде звёзд: заполненные показывают оценку, пустые — недостающие
 * шаги до 5/5. Значение 0 означает «не оценено» (все звёзды пустые).
 * В режиме `editable` звёзды выбираются кликом, повторный клик по текущей
 * оценке сбрасывает её до 0.
 */
export function StarRating({
  value,
  label,
  editable = false,
  onChange,
  size = "md",
  className,
}: StarRatingProps) {
  // Оценка, на которую наведён курсор в режиме выбора.
  const [hovered, setHovered] = useState<number | null>(null);

  const shown = hovered ?? value;
  const starSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  if (!editable) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label ? (
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </span>
        ) : null}
        <div
          className="flex items-center gap-2"
          role="img"
          aria-label={`Рейтинг: ${value} из ${MAX_RATING}`}
        >
          <Stars filled={shown} sizeClass={starSize} />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {value} из {MAX_RATING}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label ?? "Рейтинг"}</span>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-0.5"
          role="radiogroup"
          aria-label="Рейтинг"
          onMouseLeave={() => setHovered(null)}
        >
          {Array.from({ length: MAX_RATING }, (_, index) => index + 1).map(
            (star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={value === star}
                aria-label={`${star} из ${MAX_RATING}`}
                onMouseEnter={() => setHovered(star)}
                onFocus={() => setHovered(star)}
                onClick={() => onChange?.(value === star ? 0 : star)}
                className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
              >
                <Star filled={star <= shown} sizeClass={starSize} />
              </button>
            ),
          )}
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {value} из {MAX_RATING}
        </span>
      </div>
    </div>
  );
}

/** Ряд звёзд: первые `filled` — заполненные, остальные — пустые. */
function Stars({
  filled,
  sizeClass,
}: {
  filled: number;
  sizeClass: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star key={index} filled={index < filled} sizeClass={sizeClass} />
      ))}
    </div>
  );
}

/** Одна звезда: заполненная (цветом) или пустая (контуром). */
function Star({ filled, sizeClass }: { filled: boolean; sizeClass: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        sizeClass,
        filled
          ? "fill-amber-400 text-amber-400"
          : "fill-none text-zinc-300 dark:text-zinc-600",
      )}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85z" />
    </svg>
  );
}
