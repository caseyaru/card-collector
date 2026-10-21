import { Router } from "express";
import { createId, readDb, writeDb } from "../db.js";
import type { Database, Card } from "../types.js";

export const cardsRouter = Router();

const MAX_CHARACTER_NAME_LENGTH = 80;

/** Ошибка валидации названия или null, если всё в порядке. */
function validateName(name: string): string | null {
  if (!name) return "Название карточки обязательно";
  if (name.includes("/")) return "Название не может содержать символ «/»";
  return null;
}

/** Ошибка валидации ссылки на изображение или null. */
function validateImageUrl(imageUrl: string): string | null {
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return "Ссылка на изображение должна начинаться с http:// или https://";
  }
  return null;
}

/** Есть ли карточка с таким названием (без учёта регистра). */
function nameTaken(db: Database, name: string, exceptId?: string): boolean {
  const lower = name.toLowerCase();
  return db.cards.some(
    (card) => card.id !== exceptId && card.name.toLowerCase() === lower,
  );
}

/**
 * Преобразует идентификаторы персонажей в актуальный список id:
 * существующие берёт как есть, новые создаёт в справочнике.
 * Возвращает ошибку, если указан несуществующий id.
 */
function resolveCharacters(
  db: Database,
  rawIds: unknown,
  rawNames: unknown,
): { ids: string[] } | { error: string } {
  const requestedIds = Array.isArray(rawIds)
    ? rawIds.filter((id): id is string => typeof id === "string")
    : [];

  const existing = new Set(db.characters.map((character) => character.id));
  const unknownId = requestedIds.find((id) => !existing.has(id));
  if (unknownId) {
    return { error: "Указан несуществующий персонаж" };
  }

  // Имена могут прийти строкой («Аня, Борис») или массивом.
  const rawNameList = Array.isArray(rawNames)
    ? rawNames
    : typeof rawNames === "string"
      ? rawNames.split(",")
      : [];
  const names = rawNameList
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  const tooLong = names.find((name) => name.length > MAX_CHARACTER_NAME_LENGTH);
  if (tooLong) {
    return { error: "Имя персонажа слишком длинное" };
  }

  const ids = [...new Set(requestedIds)];
  for (const name of names) {
    const lower = name.toLowerCase();
    let character = db.characters.find(
      (item) => item.name.toLowerCase() === lower,
    );
    if (!character) {
      character = { id: createId("char"), name };
      db.characters.push(character);
    }
    if (!ids.includes(character.id)) ids.push(character.id);
  }

  return { ids };
}

/** GET /api/cards — все карточки. */
cardsRouter.get("/", async (_req, res) => {
  const db = await readDb();
  res.json(db.cards);
});

/**
 * POST /api/cards — создать карточку:
 * { name, imageUrl?, collectionIds?, characterIds?, characterNames? }.
 * Имена персонажей (общий ввод через запятую) создаются автоматически.
 */
cardsRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as {
    name?: unknown;
    imageUrl?: unknown;
    collectionIds?: unknown;
    characterIds?: unknown;
    characterNames?: unknown;
  };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const nameError = validateName(name);
  if (nameError) {
    res.status(400).json({ error: nameError });
    return;
  }

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const urlError = validateImageUrl(imageUrl);
  if (urlError) {
    res.status(400).json({ error: urlError });
    return;
  }

  const collectionIds = Array.isArray(body.collectionIds)
    ? body.collectionIds.filter((id): id is string => typeof id === "string")
    : [];

  const db = await readDb();

  if (nameTaken(db, name)) {
    res.status(409).json({ error: "Карточка с таким названием уже существует" });
    return;
  }

  const existingIds = new Set(db.collections.map((collection) => collection.id));
  const unknownId = collectionIds.find((id) => !existingIds.has(id));
  if (unknownId) {
    res.status(400).json({ error: "Указана несуществующая коллекция" });
    return;
  }

  const characters = resolveCharacters(db, body.characterIds, body.characterNames);
  if ("error" in characters) {
    res.status(400).json({ error: characters.error });
    return;
  }

  const card: Card = {
    id: createId("card"),
    name,
    ...(imageUrl ? { imageUrl } : {}),
    collectionIds: [...new Set(collectionIds)],
    characterIds: characters.ids,
  };

  db.cards.push(card);
  await writeDb(db);

  res.status(201).json(card);
});

/** GET /api/cards/:name — одна карточка по названию. */
cardsRouter.get("/:name", async (req, res) => {
  const db = await readDb();
  const card = db.cards.find((item) => item.name === req.params.name);

  if (!card) {
    res.status(404).json({ error: "Карточка не найдена" });
    return;
  }

  res.json(card);
});

/**
 * PUT /api/cards/:name — обновить карточку:
 * { name?, imageUrl?, collectionIds?, characterIds?, characterNames? }.
 */
cardsRouter.put("/:name", async (req, res) => {
  const body = (req.body ?? {}) as {
    name?: unknown;
    imageUrl?: unknown;
    collectionIds?: unknown;
    characterIds?: unknown;
    characterNames?: unknown;
  };

  const db = await readDb();
  const card = db.cards.find((item) => item.name === req.params.name);

  if (!card) {
    res.status(404).json({ error: "Карточка не найдена" });
    return;
  }

  const nextName =
    typeof body.name === "string" && body.name.trim() ? body.name.trim() : card.name;
  const nameError = validateName(nextName);
  if (nameError) {
    res.status(400).json({ error: nameError });
    return;
  }

  if (nameTaken(db, nextName, card.id)) {
    res.status(409).json({ error: "Карточка с таким названием уже существует" });
    return;
  }

  let nextImageUrl = card.imageUrl ?? "";
  if (typeof body.imageUrl === "string") {
    nextImageUrl = body.imageUrl.trim();
    const urlError = validateImageUrl(nextImageUrl);
    if (urlError) {
      res.status(400).json({ error: urlError });
      return;
    }
  }

  let nextCollectionIds = card.collectionIds;
  if (Array.isArray(body.collectionIds)) {
    const requested = body.collectionIds.filter(
      (id): id is string => typeof id === "string",
    );
    const existingIds = new Set(db.collections.map((collection) => collection.id));
    const unknownId = requested.find((id) => !existingIds.has(id));
    if (unknownId) {
      res.status(400).json({ error: "Указана несуществующая коллекция" });
      return;
    }
    nextCollectionIds = [...new Set(requested)];
  }

  let nextCharacterIds = card.characterIds;
  if (body.characterIds !== undefined || body.characterNames !== undefined) {
    const characters = resolveCharacters(db, body.characterIds, body.characterNames);
    if ("error" in characters) {
      res.status(400).json({ error: characters.error });
      return;
    }
    nextCharacterIds = characters.ids;
  }

  // Сначала убираем imageUrl, затем добавляем только актуальную —
  // иначе очистка ссылки оставила бы старое значение из spread.
  const { imageUrl: _previousUrl, ...withoutUrl } = card;
  void _previousUrl;
  const updated: Card = {
    ...withoutUrl,
    name: nextName,
    ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
    collectionIds: nextCollectionIds,
    characterIds: nextCharacterIds,
  };
  db.cards[db.cards.indexOf(card)] = updated;
  await writeDb(db);

  res.json(updated);
});

/** DELETE /api/cards/:name — удалить карточку. */
cardsRouter.delete("/:name", async (req, res) => {
  const db = await readDb();
  const index = db.cards.findIndex((item) => item.name === req.params.name);

  if (index === -1) {
    res.status(404).json({ error: "Карточка не найдена" });
    return;
  }

  db.cards.splice(index, 1);
  await writeDb(db);

  res.json({ ok: true });
});
