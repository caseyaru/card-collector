import type { Card } from "@/entities/card";

/** Персонаж (запись справочника). */
export interface Character {
  id: string;
  name: string;
}

/** Персонаж с количеством карточек (ответ GET /api/characters). */
export interface CharacterWithStats extends Character {
  cardsCount: number;
}

/** Персонаж с карточками (ответ GET /api/characters/:name). */
export interface CharacterWithCards extends Character {
  cards: Card[];
}
