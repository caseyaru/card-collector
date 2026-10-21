/** Карточка. */
export interface Card {
  id: string;
  name: string;
  /** Ссылка на изображение (может отсутствовать). */
  imageUrl?: string;
  /** Идентификаторы коллекций, в которые входит карточка. */
  collectionIds: string[];
  /** Идентификаторы персонажей карточки. */
  characterIds: string[];
}

/** Данные для создания карточки. */
export interface CardInput {
  name: string;
  imageUrl?: string;
  collectionIds?: string[];
  /** Идентификаторы выбранных из справочника персонажей. */
  characterIds?: string[];
  /** Новые персонажи, введённые через запятую (создаются на сервере). */
  characterNames?: string[];
}
