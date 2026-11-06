/** Персонаж (запись справочника). */
export interface Character {
  id: string;
  name: string;
}

/** Персонаж с количеством карточек (ответ GET /api/characters). */
export interface CharacterWithStats extends Character {
  cardsCount: number;
}
