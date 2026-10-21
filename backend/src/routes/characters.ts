import { Router } from "express";
import { createId, readDb, writeDb } from "../db.js";
import type { Character } from "../types.js";

export const charactersRouter = Router();

const MAX_NAME_LENGTH = 80;

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

/** POST /api/characters — создать персонажа: { name }. */
charactersRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    res.status(400).json({ error: "Имя персонажа обязательно" });
    return;
  }

  if (name.length > MAX_NAME_LENGTH) {
    res.status(400).json({ error: "Имя персонажа слишком длинное" });
    return;
  }

  const db = await readDb();
  const existing = db.characters.find(
    (character) => character.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    // Персонаж с таким именем уже есть — возвращаем его, повтор не создаём.
    res.status(200).json({ ...existing, cardsCount: 0 });
    return;
  }

  const character: Character = { id: createId("char"), name };
  db.characters.push(character);
  await writeDb(db);

  res.status(201).json({ ...character, cardsCount: 0 });
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
