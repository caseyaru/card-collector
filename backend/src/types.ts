/** Карточка. */
export interface Card {
  id: string;
  name: string;
  imageUrl?: string;
  /** Идентификаторы коллекций, в которые входит карточка. */
  collectionIds: string[];
  /** Идентификаторы персонажей карточки. */
  characterIds: string[];
}

/** Коллекция карточек. */
export interface Collection {
  id: string;
  name: string;
}

/** Персонаж (сущность из справочника, на которую ссылаются карточки). */
export interface Character {
  id: string;
  name: string;
}

/** Структура файла хранилища (backend/data/db.json). */
export interface Database {
  collections: Collection[];
  characters: Character[];
  cards: Card[];
}
