"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CharacterWithStats } from "@/entities/character";
import { CreateCharacterDialog } from "@/features/create-character";
import { fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, PageHeader } from "@/shared/ui";

/** Список персонажей + создание персонажа через попап. */
export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterWithStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCharacters(await fetchJson<CharacterWithStats[]>("/api/characters"));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить персонажей",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <PageHeader
        title="Персонажи"
        description="Персонажи прикрепляются к карточкам. У одной карточки может быть несколько персонажей, а персонаж может встречаться в любом количестве карточек."
        actions={<CreateCharacterDialog onAdded={() => void load()} />}
      />

      {error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Повторить
          </Button>
        </div>
      ) : null}

      {characters === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем персонажей…
        </p>
      ) : null}

      {characters !== null && characters.length === 0 && !error ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="max-w-md text-sm leading-6 text-muted">
            Персонажей пока нет. Нажмите «Создать персонажа» или добавьте имя
            прямо в форме карточки.
          </p>
        </div>
      ) : null}

      {characters !== null && characters.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <li key={character.id}>
              <Link
                href={`/characters/${encodeURIComponent(character.name)}`}
                className="group flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-pink/30 hover:shadow-lg hover:shadow-brand-pink/10"
              >
                <span className="font-medium">{character.name}</span>
                <span className="text-sm text-muted">
                  {pluralizeCards(character.cardsCount)}
                </span>
                <span className="text-sm text-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand-pink-deep">
                  Открыть →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
