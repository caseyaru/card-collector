import { Router } from "express";
import { createId, readDb, writeDb } from "../db.js";
import type { Collection } from "../types.js";

export const collectionsRouter = Router();

/** GET /api/collections — все коллекции с количеством карточек. */
collectionsRouter.get("/", async (_req, res) => {
  const db = await readDb();
  const withStats = db.collections.map((collection) => ({
    ...collection,
    cardsCount: db.cards.filter((card) => card.collectionIds.includes(collection.id))
      .length,
  }));
  res.json(withStats);
});

/** POST /api/collections — создать коллекцию: { name }. */
collectionsRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    res.status(400).json({ error: "Название коллекции обязательно" });
    return;
  }

  if (name.includes("/")) {
    res.status(400).json({ error: "Название не может содержать символ «/»" });
    return;
  }

  const db = await readDb();

  const duplicated = db.collections.some(
    (collection) => collection.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicated) {
    res.status(409).json({ error: "Коллекция с таким названием уже существует" });
    return;
  }

  const collection: Collection = { id: createId("col"), name };
  db.collections.push(collection);
  await writeDb(db);

  res.status(201).json({ ...collection, cardsCount: 0 });
});

/** PATCH /api/collections/:id — переименовать коллекцию: { name }. */
collectionsRouter.patch("/:id", async (req, res) => {
  const body = (req.body ?? {}) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    res.status(400).json({ error: "Название коллекции обязательно" });
    return;
  }

  if (name.includes("/")) {
    res.status(400).json({ error: "Название не может содержать символ «/»" });
    return;
  }

  const db = await readDb();
  const index = db.collections.findIndex(
    (collection) => collection.id === req.params.id,
  );

  if (index === -1) {
    res.status(404).json({ error: "Коллекция не найдена" });
    return;
  }

  const duplicated = db.collections.some(
    (collection) =>
      collection.id !== req.params.id &&
      collection.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicated) {
    res.status(409).json({ error: "Коллекция с таким названием уже существует" });
    return;
  }

  const collection = { ...db.collections[index], name };
  db.collections[index] = collection;
  await writeDb(db);

  const cardsCount = db.cards.filter((card) =>
    card.collectionIds.includes(collection.id),
  ).length;
  res.json({ ...collection, cardsCount });
});

/** GET /api/collections/:name — коллекция с её карточками. */
collectionsRouter.get("/:name", async (req, res) => {
  const { name } = req.params;

  const db = await readDb();
  const collection = db.collections.find((item) => item.name === name);

  if (!collection) {
    res.status(404).json({ error: "Коллекция не найдена" });
    return;
  }

  const cards = db.cards.filter((card) => card.collectionIds.includes(collection.id));
  res.json({ ...collection, cards });
});

/** DELETE /api/collections/:id — удалить коллекцию и убрать её из карточек. */
collectionsRouter.delete("/:id", async (req, res) => {
  const db = await readDb();
  const index = db.collections.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Коллекция не найдена" });
    return;
  }

  db.collections.splice(index, 1);
  for (const card of db.cards) {
    card.collectionIds = card.collectionIds.filter(
      (id) => id !== req.params.id,
    );
  }
  await writeDb(db);

  res.json({ ok: true });
});
