/** Карточка. */
export interface Card {
  id: string;
  name: string;
  /** Ссылка на изображение (может отсутствовать). */
  imageUrl?: string;
  /** Оценка карточки от 0 до 5 (0 — пользователь не оценивал). */
  rating: number;
  /** Идентификатор сета (может отсутствовать). */
  setId?: string;
  /** Идентификаторы коллекций, в которые входит карточка. */
  collectionIds: string[];
  /** Идентификаторы персонажей карточки. */
  characterIds: string[];
}

/** Данные для создания карточки. */
export interface CardInput {
  name: string;
  imageUrl?: string;
  /** Оценка карточки от 0 до 5 (0 — не оценивать). */
  rating?: number;
  collectionIds?: string[];
  /** Идентификаторы выбранных из справочника персонажей. */
  characterIds?: string[];
  /** Новые персонажи, введённые через запятую (создаются на сервере). */
  characterNames?: string[];
  /** Идентификатор выбранного из справочника сета. */
  setId?: string;
  /** Название нового сета (создаётся на сервере). */
  setName?: string;
}
