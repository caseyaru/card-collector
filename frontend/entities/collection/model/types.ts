import type { Card } from "@/entities/card";

/** Коллекция карточек. */
export interface Collection {
  id: string;
  name: string;
}

/** Коллекция с количеством карточек (ответ GET /api/collections). */
export interface CollectionWithStats extends Collection {
  cardsCount: number;
}

/** Коллекция с карточками (ответ GET /api/collections/:name). */
export interface CollectionWithCards extends Collection {
  cards: Card[];
}
