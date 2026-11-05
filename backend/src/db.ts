import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Database } from "./types.js";

/** Путь к файлу хранилища. Переопределяется переменной окружения DB_PATH. */
const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "db.json");

function emptyDb(): Database {
  return { collections: [], characters: [], sets: [], cards: [] };
}

/** Читает базу из JSON-файла. Отсутствующий файл трактуется как пустая база. */
export async function readDb(): Promise<Database> {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      collections: parsed.collections ?? [],
      characters: parsed.characters ?? [],
      sets: parsed.sets ?? [],
      // Карточки из более старых версий могут не иметь characterIds и rating.
      cards: (parsed.cards ?? []).map((card) => ({
        ...card,
        rating: card.rating ?? 0,
        collectionIds: card.collectionIds ?? [],
        characterIds: card.characterIds ?? [],
      })),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyDb();
    }
    throw error;
  }
}

/** Записывает базу в JSON-файл (атомарно через временный файл не требуется — данные небольшие). */
export async function writeDb(db: Database): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

/** Генерирует короткий уникальный идентификатор с префиксом. */
export function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 10)}`;
}
