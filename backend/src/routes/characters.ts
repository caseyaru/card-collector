import { Router } from "express";
import { createId, readDb, writeDb } from "../db.js";
import type { Character } from "../types.js";

export const charactersRouter = Router();

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 1000;

/** Ошибка валидации ссылки на фото или null, если всё в порядке. */
function validateImageUrl(imageUrl: string): string | null {
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return "Ссылка на фото должна начинаться с http:// или https://";
  }
  return null;
}

/** Ошибка валидации дополнительной информации или null. */
function validateDescription(description: string): string | null {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return "Дополнительная информация слишком длинная";
  }
  return null;
}

/** GET /api/characters — справочник персонажей с количеством карточек. */
charactersRouter.get("/", async (_req, res) => {
  const db = await readDb();
  const withStats = db.characters.map((character) => ({
    ...character,
    cardsCount: db.cards.filter((card) => card.characterIds.includes(character.id))
      .length,
  }));
  res.json(withStats);
});

/** POST /api/characters — создать персонажа: { name, imageUrl?, description? }. */
charactersRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as {
    name?: unknown;
    imageUrl?: unknown;
    description?: unknown;
  };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!name) {
    res.status(400).json({ error: "Имя персонажа обязательно" });
    return;
  }

  if (name.length > MAX_NAME_LENGTH) {
    res.status(400).json({ error: "Имя персонажа слишком длинное" });
    return;
  }

  if (name.includes("/")) {
    res.status(400).json({ error: "Имя персонажа не может содержать символ «/»" });
    return;
  }

  const imageError = validateImageUrl(imageUrl);
  if (imageError) {
    res.status(400).json({ error: imageError });
    return;
  }

  const descriptionError = validateDescription(description);
  if (descriptionError) {
    res.status(400).json({ error: descriptionError });
    return;
  }

  const db = await readDb();
  const existing = db.characters.find(
    (character) => character.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    // Персонаж с таким именем уже есть — возвращаем его, повтор не создаём.
    const cardsCount = db.cards.filter((card) =>
      card.characterIds.includes(existing.id),
    ).length;
    res.status(200).json({ ...existing, cardsCount });
    return;
  }

  const character: Character = { id: createId("char"), name };
  if (imageUrl) character.imageUrl = imageUrl;
  if (description) character.description = description;

  db.characters.push(character);
  await writeDb(db);

  res.status(201).json({ ...character, cardsCount: 0 });
});

/** PATCH /api/characters/:id — обновить персонажа: { name?, imageUrl?, description? }. */
charactersRouter.patch("/:id", async (req, res) => {
  const body = (req.body ?? {}) as {
    name?: unknown;
    imageUrl?: unknown;
    description?: unknown;
  };

  const db = await readDb();
  const index = db.characters.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Персонаж не найден" });
    return;
  }

  const current = db.characters[index];
  const hasName = Object.prototype.hasOwnProperty.call(body, "name");
  const hasImageUrl = Object.prototype.hasOwnProperty.call(body, "imageUrl");
  const hasDescription = Object.prototype.hasOwnProperty.call(
    body,
    "description",
  );

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (hasName) {
    if (!name) {
      res.status(400).json({ error: "Имя персонажа обязательно" });
      return;
    }

    if (name.length > MAX_NAME_LENGTH) {
      res.status(400).json({ error: "Имя персонажа слишком длинное" });
      return;
    }

    if (name.includes("/")) {
      res.status(400).json({ error: "Имя персонажа не может содержать символ «/»" });
      return;
    }
  }

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (hasImageUrl) {
    const imageError = validateImageUrl(imageUrl);
    if (imageError) {
      res.status(400).json({ error: imageError });
      return;
    }
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (hasDescription) {
    const descriptionError = validateDescription(description);
    if (descriptionError) {
      res.status(400).json({ error: descriptionError });
      return;
    }
  }

  const resolvedName = hasName ? name : current.name;
  const duplicated = db.characters.some(
    (item) =>
      item.id !== req.params.id &&
      item.name.toLowerCase() === resolvedName.toLowerCase(),
  );
  if (duplicated) {
    res.status(409).json({ error: "Персонаж с таким именем уже существует" });
    return;
  }

  const character: Character = { ...current, name: resolvedName };
  if (hasImageUrl) {
    if (imageUrl) character.imageUrl = imageUrl;
    else delete character.imageUrl;
  }
  if (hasDescription) {
    if (description) character.description = description;
    else delete character.description;
  }

  db.characters[index] = character;
  await writeDb(db);

  const cardsCount = db.cards.filter((card) =>
    card.characterIds.includes(character.id),
  ).length;
  res.json({ ...character, cardsCount });
});

/** GET /api/characters/:name — персонаж с его карточками. */
charactersRouter.get("/:name", async (req, res) => {
  const db = await readDb();
  const character = db.characters.find((item) => item.name === req.params.name);

  if (!character) {
    res.status(404).json({ error: "Персонаж не найден" });
    return;
  }

  const cards = db.cards.filter((card) =>
    card.characterIds.includes(character.id),
  );
  res.json({ ...character, cards });
});

/** DELETE /api/characters/:id — удалить персонажа из справочника и из карточек. */
charactersRouter.delete("/:id", async (req, res) => {
  const db = await readDb();
  const index = db.characters.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Персонаж не найден" });
    return;
  }

  db.characters.splice(index, 1);
  for (const card of db.cards) {
    card.characterIds = card.characterIds.filter((id) => id !== req.params.id);
  }
  await writeDb(db);

  res.json({ ok: true });
});
