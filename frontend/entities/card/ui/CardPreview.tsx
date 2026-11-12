"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Card } from "../model/types";

interface CardPreviewProps {
  card: Card;
}

/** Маленькое превью карточки: изображение и название, клик ведёт на страницу карточки. */
export function CardPreview({ card }: CardPreviewProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = /^https?:\/\//i.test(card.imageUrl ?? "")
    ? (card.imageUrl as string)
    : "";
  const showImage = Boolean(imageSource) && !imageFailed;

  return (
    <Link
      href={`/cards/${encodeURIComponent(card.name)}`}
      className="group flex flex-col gap-2 rounded-xl border border-line bg-white p-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/30 hover:shadow-md hover:shadow-brand-pink/10"
    >
      <div className="relative aspect-[5/7] w-full overflow-hidden rounded-lg bg-lilac-soft">
        {showImage ? (
          <Image
            src={imageSource}
            alt={card.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 140px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-[11px] text-faint">
            Нет изображения
          </div>
        )}
      </div>
      <span className="line-clamp-2 text-xs font-medium leading-4 transition-colors group-hover:text-brand-pink-deep">
        {card.name}
      </span>
    </Link>
  );
}
