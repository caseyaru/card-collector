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
| `app`       | Роутинг Next.js, composition корневой разметки | `app/layout.tsx`, `app/cards/page.tsx`, `app/collection/[slug]/page.tsx`, `app/cards/[slug]/page.tsx` |
| `widgets`   | Крупные составные блоки интерфейса             | `widgets/app-header`, `widgets/app-footer`      |
| `features`  | Пользовательские действия                      | `features/add-card`, `features/create-collection`, `features/card-characters`, `features/filter-cards-by-character` |
| `entities`  | Сущности предметной области                    | `entities/card`, `entities/collection`, `entities/character` |
| `shared`    | Переиспользуемые инструменты без бизнес-логики | `shared/ui`, `shared/lib`, `shared/config`      |

## Правила импортов

- Импорт только «вниз»: `app → widgets → features → entities → shared`.
- Соседние срезы одного слоя не импортируют друг друга напрямую.
- Публичный API среза — `index.ts`; внутренние файлы (`model/`, `ui/`) снаружи не импортируются.
- Пути через алиас `@/*` (см. `frontend/tsconfig.json`): например `@/shared/ui`, `@/entities/card`.

## Данные и API

- Бэкенд хранит данные в `backend/data/db.json` (файл не в репозитории; пример — `backend/data/db.example.json`), эндпоинты: `/api/cards`, `/api/collections`, `/api/characters`.
- Фронтенд ходит в API по пути `/api/*` — Next.js проксирует запросы на `http://localhost:4000` (см. `rewrites` в `frontend/next.config.ts`).
- Страницы `/cards` и `/collection` — клиентские: загружают данные через `shared/lib/fetcher` (`cache: "no-store"`) и обновляют список после мутаций из фич.
- Персонажи — отдельная сущность (`entities/character`); карточка ссылается на них через `characterIds`, новые имена создаются на сервере при сохранении.

## Маршруты

| Путь                   | Страница                                        |
| ---------------------- | ----------------------------------------------- |
| `/`                    | Главная                                         |
| `/cards`               | Общий список карточек + «Добавить карточку» + фильтр по персонажам |
| `/cards/{name}`        | Страница карточки: информация, редактирование, удаление |
| `/collection`          | Список коллекций + «Создать коллекцию»          |
| `/collection/{name}`   | Карточки конкретной коллекции (404-состояние)   |

`app` содержит только точку входа (роутинг и metadata), UI собирается из слоёв FSD.
