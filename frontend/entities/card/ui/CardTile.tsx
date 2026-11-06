"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { StarRating } from "@/shared/ui/StarRating";
import type { Card } from "../model/types";

interface CardTileProps {
  card: Card;
  /** Названия коллекций, в которые входит карточка (для бейджей). */
  badges?: string[];
  /** Имена персонажей карточки (для бейджей). */
  characterBadges?: string[];
  /** Название сета карточки, если задан (для бейджа). */
  setBadge?: string;
}

/**
 * Карточка в списке: изображение, название, бейджи коллекций, персонажей и сета.
 * Вся плитка — ссылка на страницу карточки /cards/{название}.
 */
export function CardTile({
  card,
  badges = [],
  characterBadges = [],
  setBadge,
}: CardTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(card.imageUrl) && !imageFailed;

  return (
    <Link
      href={`/cards/${encodeURIComponent(card.name)}`}
      className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/30 hover:shadow-lg hover:shadow-brand-pink/10">
        <div className="relative aspect-[5/7] w-full bg-lilac-soft">
          {showImage ? (
            <Image
              src={card.imageUrl as string}
              alt={card.name}
              fill
              sizes="(max-width: 640px) 100vw, 220px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-faint">
              Нет изображения
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3">
          <h3 className="text-sm font-medium leading-5">{card.name}</h3>
          {/* Сет необязателен: если не задан — бейджа нет. */}
          {setBadge ? (
            <ul className="flex flex-wrap gap-1">
              <li className="rounded-full bg-brand-blue/15 px-2 py-0.5 text-xs text-brand-blue-deep">
                {setBadge}
              </li>
            </ul>
          ) : null}
          {characterBadges.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {characterBadges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-line-strong px-2 py-0.5 text-xs text-muted"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}
          {badges.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full bg-brand-lilac/40 px-2 py-0.5 text-xs text-ink-soft"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}
          <StarRating value={card.rating} size="sm" />
        </div>
      </article>
    </Link>
  );
}
