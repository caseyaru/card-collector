/** Карточка. */
export interface Card {
  id: string;
  name: string;
  imageUrl?: string;
  /** Оценка карточки от 0 до 5 (0 — пользователь не оценивал). */
  rating: number;
  /** Идентификатор сета (необязательно; пусто означает «сета нет»). */
  setId?: string;
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
  /** Ссылка на фото персонажа (необязательно). */
  imageUrl?: string;
  /** Дополнительная информация о персонаже (необязательно). */
  description?: string;
}

/** Сет (сущность из справочника; у карточки может быть не более одного). */
export interface CardSet {
  id: string;
  name: string;
}

/** Структура файла хранилища (backend/data/db.json). */
export interface Database {
  collections: Collection[];
  characters: Character[];
  sets: CardSet[];
  cards: Card[];
}
