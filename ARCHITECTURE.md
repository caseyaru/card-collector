# Архитектура проекта (FSD)

Монорепозиторий: `backend` (Express API) + `frontend` (Next.js, FSD).

```
card-collector/
├── backend/     # Express 5 + TypeScript, хранилище — JSON-файл backend/data/db.json (пример: db.example.json)
└── frontend/    # Next.js 16, корневой FSD-слой — app (entrypoints)
```

## Слои фронтенда (снизу вверх)

| Слой        | Назначение                                    | Примеры в проекте                              |
| ----------- | --------------------------------------------- | ---------------------------------------------- |
| `app`       | Роутинг Next.js, composition корневой разметки | `app/layout.tsx`, `app/cards/page.tsx`, `app/collection/[slug]/page.tsx`, `app/sets/[slug]/page.tsx`, `app/cards/[slug]/page.tsx` |
| `widgets`   | Крупные составные блоки интерфейса             | `widgets/app-header`, `widgets/app-footer`      |
| `features`  | Пользовательские действия                      | `features/add-card`, `features/create-collection`, `features/create-set`, `features/create-character`, `features/rename-entity`, `features/card-characters`, `features/card-set`, `features/filter-cards-by-character`, `features/filter-cards-by-set` |
| `entities`  | Сущности предметной области                    | `entities/card`, `entities/collection`, `entities/character`, `entities/set` |
| `shared`    | Переиспользуемые инструменты без бизнес-логики | `shared/ui`, `shared/lib`, `shared/config`      |

## Правила импортов

- Импорт только «вниз»: `app → widgets → features → entities → shared`.
- Соседние срезы одного слоя не импортируют друг друга напрямую.
- Публичный API среза — `index.ts`; внутренние файлы (`model/`, `ui/`) снаружи не импортируются.
- Пути через алиас `@/*` (см. `frontend/tsconfig.json`): например `@/shared/ui`, `@/entities/card`.

## Данные и API

- Бэкенд хранит данные в `backend/data/db.json` (файл не в репозитории; пример — `backend/data/db.example.json`), эндпоинты: `/api/cards`, `/api/collections`, `/api/characters`, `/api/sets`.
- Фронтенд ходит в API по пути `/api/*` — Next.js проксирует запросы на `http://localhost:4000` (см. `rewrites` в `frontend/next.config.ts`).
- Страницы `/cards` и `/collection` — клиентские: загружают данные через `shared/lib/fetcher` (`cache: "no-store"`) и обновляют список после мутаций из фич.
- Персонажи — отдельная сущность (`entities/character`); карточка ссылается на них через `characterIds`, новые имена создаются на сервере при сохранении. На странице персонажа имя меняется по `id`, поэтому связанные карточки автоматически показывают новое имя; при удалении `id` убирается из карточек.
- Сет — отдельная сущность (`entities/set`); у карточки не более одного сета (`setId`), новое название создаётся на сервере (поле `setName`). Необязательное поле: если не задано, блок сета не отображается, а на бэкенде значение пустое.
- Рейтинг карточки (`rating`, целое 0–5, где 0 — «не оценивал») — поле всегда присутствует; в UI отображается компонентом `shared/ui/StarRating` (просмотр и выбор, повторный клик сбрасывает до 0).

## Маршруты

| Путь                   | Страница                                        |
| ---------------------- | ----------------------------------------------- |
| `/`                    | Главная                                         |
| `/cards`               | Общий список карточек + «Добавить карточку» + фильтры по персонажам и сетам |
| `/cards/{name}`        | Страница карточки: информация, редактирование, удаление |
| `/collection`          | Список коллекций + «Создать коллекцию»          |
| `/collection/{name}`   | Карточки конкретной коллекции (404-состояние) + фильтры, переименование, удаление |
| `/sets`                | Список сетов + «Создать сет»                    |
| `/sets/{name}`         | Карточки конкретного сета (404-состояние) + фильтр по персонажам, переименование, удаление |
| `/characters`          | Список персонажей + «Создать персонажа»         |
| `/characters/{name}`   | Карточки конкретного персонажа (404-состояние), переименование, удаление |

`app` содержит только точку входа (роутинг и metadata), UI собирается из слоёв FSD.
