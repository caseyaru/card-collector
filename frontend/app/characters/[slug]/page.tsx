"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CardPreview } from "@/entities/card";
import type { Character, CharacterWithCards } from "@/entities/character";
import { ApiError, fetchJson } from "@/shared/lib/fetcher";
import { pluralizeCards } from "@/shared/lib/pluralize";
import { Button, Container, TextArea, TextField } from "@/shared/ui";

/** Страница персонажа: /characters/{имя}. */
export default function CharacterDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const characterName = decodeURIComponent(slug);
  const router = useRouter();

  const [character, setCharacter] = useState<CharacterWithCards | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Режим редактирования.
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Ссылка, подтянутая в превью (обновляется при выходе поля из фокуса).
  const [imagePreview, setImagePreview] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      setCharacter(
        await fetchJson<CharacterWithCards>(
          `/api/characters/${encodeURIComponent(characterName)}`,
        ),
      );
      setNotFound(false);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        return;
      }
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить персонажа",
      );
    }
  }, [characterName]);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit() {
    if (!character) return;

    setName(character.name);
    setImageUrl(character.imageUrl ?? "");
    setImagePreview(character.imageUrl ?? "");
    setPreviewFailed(false);
    setDescription(character.description ?? "");
    setFormError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setFormError(null);
  }

  /** Подтягивает ссылку из поля в превью при потере фокуса. */
  function commitImagePreview() {
    setImagePreview(imageUrl.trim());
    setPreviewFailed(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!character) return;

    setPending(true);
    setFormError(null);

    try {
      const updated = await fetchJson<Character>(
        `/api/characters/${character.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name, imageUrl, description }),
        },
      );

      setCharacter({
        ...character,
        name: updated.name,
        imageUrl: updated.imageUrl,
        description: updated.description,
      });
      setEditing(false);
      setPreviewFailed(false);

      if (updated.name !== characterName) {
        router.replace(`/characters/${encodeURIComponent(updated.name)}`);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Не удалось сохранить персонажа",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!character) return;

    setDeleting(true);
    setError(null);

    try {
      await fetchJson(`/api/characters/${character.id}`, { method: "DELETE" });
      router.push("/characters");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить персонажа",
      );
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (notFound) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Персонаж не найден</h1>
        <p className="max-w-md text-sm leading-6 text-muted">
          Персонажа «{characterName}» не существует. Возможно, он был удалён или
          в адресе опечатка.
        </p>
        <Button href="/characters">К списку персонажей</Button>
      </Container>
    );
  }

  const previewSource = editing
    ? imagePreview
    : (character?.imageUrl ?? "");
  // next/image принимает только абсолютный http(s)-адрес; остальное — как «нет фото».
  const shownImageUrl = /^https?:\/\//i.test(previewSource) ? previewSource : "";
  const initial = character?.name.trim().charAt(0).toUpperCase() ?? "";

  return (
    <Container className="flex flex-1 flex-col gap-8 py-10">
      <Link
        href="/characters"
        className="inline-flex h-9 w-fit items-center rounded-full border border-line-strong bg-white px-3 text-sm transition-colors hover:border-brand-pink/40 hover:bg-lilac-soft"
      >
        ← Все персонажи
      </Link>

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

      {character === null && !error ? (
        <p className="py-20 text-center text-sm text-muted">
          Загружаем персонажа…
        </p>
      ) : null}

      {character !== null ? (
        <>
          <section className="grid gap-6 rounded-3xl border border-line bg-white p-5 shadow-sm md:grid-cols-[minmax(0,240px)_1fr] md:p-8">
            {/* Фото персонажа: в режиме редактирования показывает превью ссылки. */}
            <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl border border-line bg-lilac-soft md:max-w-none">
              {shownImageUrl && !previewFailed ? (
                <Image
                  src={shownImageUrl}
                  alt={character.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center">
                  {editing && imagePreview ? (
                    <span className="text-sm text-faint">
                      Не удалось загрузить фото
                    </span>
                  ) : initial ? (
                    <span className="text-6xl font-semibold text-brand-pink-deep/40">
                      {initial}
                    </span>
                  ) : (
                    <span className="text-sm text-faint">Нет фото</span>
                  )}
                </div>
              )}
            </div>

            {editing ? (
              <form
                onSubmit={handleSave}
                onKeyDown={(event) => {
                  // Enter в полях не должен отправлять форму: сохранение — только кнопкой.
                  if (
                    event.key === "Enter" &&
                    event.target instanceof HTMLInputElement
                  ) {
                    event.preventDefault();
                  }
                }}
                className="flex flex-col gap-4"
              >
                <h1 className="text-3xl font-semibold leading-tight">
                  Редактирование
                </h1>

                <TextField
                  label="Имя персонажа"
                  placeholder="Например: Эмбера"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoFocus
                  hint="Имя станет адресом: /characters/Имя"
                />

                <TextField
                  label="Ссылка на фото"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  onBlur={commitImagePreview}
                  hint="Необязательно. Если ссылки нет, покажем первую букву имени."
                />

                <TextArea
                  label="Дополнительная информация"
                  placeholder="Расскажите о персонаже: характер, история, способности…"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={1000}
                  hint="Необязательно. До 1000 символов."
                />

                {formError ? (
                  <p role="alert" className="text-sm text-red-600">
                    {formError}
                  </p>
                ) : null}

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={cancelEdit}
                    disabled={pending}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" size="sm" disabled={pending || !name.trim()}>
                    {pending ? "Сохраняем…" : "Сохранить"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold leading-tight">
                    {character.name}
                  </h1>
                  <p className="text-sm text-muted">
                    {pluralizeCards(character.cards.length)} с этим персонажем
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-medium text-muted">
                    Дополнительная информация
                  </h2>
                  {character.description ? (
                    <p className="max-w-2xl whitespace-pre-line text-sm leading-7 text-ink-soft">
                      {character.description}
                    </p>
                  ) : (
                    <p className="max-w-2xl text-sm leading-6 text-muted">
                      Пока нет дополнительной информации. Нажмите «Редактировать»,
                      чтобы добавить описание.
                    </p>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={startEdit}>
                    Редактировать
                  </Button>

                  {confirmingDelete ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => void handleDelete()}
                        disabled={deleting}
                      >
                        {deleting ? "Удаляем…" : "Точно удалить?"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={deleting}
                      >
                        Отмена
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmingDelete(true)}
                    >
                      Удалить
                    </Button>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Карточки с персонажем</h2>
              <p className="text-sm text-muted">
                {character.cards.length > 0
                  ? "Нажмите на превью, чтобы открыть карточку."
                  : "Список появится, когда к персонажу прикрепят карточки."}
              </p>
            </div>

            {character.cards.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-line-strong p-10 text-center">
                <p className="max-w-md text-sm leading-6 text-muted">
                  У этого персонажа пока нет карточек. Добавьте карточку на{" "}
                  <Link href="/cards" className="underline underline-offset-4">
                    странице карточек
                  </Link>{" "}
                  и отметьте этого персонажа в форме.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {character.cards.map((card) => (
                  <li key={card.id}>
                    <CardPreview card={card} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </Container>
  );
}
