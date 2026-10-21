/**
 * Склонение существительного при числительном (русскоязычная форма).
 * Пример: pluralize(1, ["карточка", "карточки", "карточек"]) → "1 карточка".
 */
export function pluralize(
  count: number,
  forms: [one: string, few: string, many: string],
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} ${forms[0]}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} ${forms[1]}`;
  }
  return `${count} ${forms[2]}`;
}

/** "1 карточка" / "2 карточки" / "5 карточек". */
export function pluralizeCards(count: number): string {
  return pluralize(count, ["карточка", "карточки", "карточек"]);
}
