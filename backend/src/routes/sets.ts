import { Router } from "express";
import { createId, readDb, writeDb } from "../db.js";
import type { CardSet } from "../types.js";

export const setsRouter = Router();

const MAX_NAME_LENGTH = 80;

/** GET /api/sets — справочник сетов с количеством карточек. */
setsRouter.get("/", async (_req, res) => {
  const db = await readDb();
  const withStats = db.sets.map((set) => ({
    ...set,
    cardsCount: db.cards.filter((card) => card.setId === set.id).length,
  }));
  res.json(withStats);
});

/** POST /api/sets — создать сет: { name }. */
setsRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    res.status(400).json({ error: "Название сета обязательно" });
    return;
  }

  if (name.length > MAX_NAME_LENGTH) {
    res.status(400).json({ error: "Название сета слишком длинное" });
    return;
  }

  const db = await readDb();
  const existing = db.sets.find(
    (set) => set.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    // Сет с таким названием уже есть — возвращаем его, повтор не создаём.
    res.status(200).json({ ...existing, cardsCount: 0 });
    return;
  }

  const set: CardSet = { id: createId("set"), name };
  db.sets.push(set);
  await writeDb(db);

  res.status(201).json({ ...set, cardsCount: 0 });
});

/** DELETE /api/sets/:id — удалить сет из справочника и отвязать от карточек. */
setsRouter.delete("/:id", async (req, res) => {
  const db = await readDb();
  const index = db.sets.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Сет не найден" });
    return;
  }

  db.sets.splice(index, 1);
  for (const card of db.cards) {
    if (card.setId === req.params.id) {
      delete card.setId;
    }
  }
  await writeDb(db);

  res.json({ ok: true });
});
