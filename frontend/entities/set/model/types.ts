/** Сет (запись справочника). У карточки может быть не более одного сета. */
export interface CardSet {
  id: string;
  name: string;
}

/** Сет с количеством карточек (ответ GET /api/sets). */
export interface CardSetWithStats extends CardSet {
  cardsCount: number;
}
