# Слой `entities`

Сущности предметной области.

- `card` — карточка: типы `Card`, `CardInput` и UI-плитка `CardTile` (изображение + название + бейджи коллекций и персонажей).
- `collection` — коллекция: типы `Collection`, `CollectionWithStats`, `CollectionWithCards`.
- `character` — персонаж: типы `Character`, `CharacterWithStats` (справочник, отдельной страницы нет).

Правила: сущности не знают о фичах и виджетах, зависят только от `shared`.
