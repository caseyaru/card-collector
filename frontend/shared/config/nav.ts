export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Основная навигация приложения. */
export const mainNav: NavItem[] = [
  { href: "/", label: "Главная" },
  {
    href: "/collection",
    label: "Коллекции",
    description: "Тематические подборки карточек",
  },
  {
    href: "/cards",
    label: "Карточки",
    description: "Общий список всех карточек",
  },
];
