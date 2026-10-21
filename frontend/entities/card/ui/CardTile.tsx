"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Card } from "../model/types";

interface CardTileProps {
  card: Card;
  /** Названия коллекций, в которые входит карточка (для бейджей). */
  badges?: string[];
  /** Имена персонажей карточки (для бейджей). */
  characterBadges?: string[];
}

/**
 * Карточка в списке: изображение, название, бейджи коллекций и персонажей.
 * Вся плитка — ссылка на страницу карточки /cards/{название}.
 */
export function CardTile({ card, badges = [], characterBadges = [] }: CardTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(card.imageUrl) && !imageFailed;

  return (
    <Link
      href={`/cards/${encodeURIComponent(card.name)}`}
      className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-[5/7] w-full bg-zinc-100 dark:bg-zinc-800">
          {showImage ? (
            <Image
              src={card.imageUrl as string}
              alt={card.name}
              fill
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Нет изображения
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3">
          <h3 className="text-sm font-medium leading-5">{card.name}</h3>
          {characterBadges.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {characterBadges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
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
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
