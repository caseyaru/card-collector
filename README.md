# Card Collector

Полноценный проект для портфолио: учёт коллекции карточек (название, изображение, коллекции, персонажи) без внешней базы данных.

**Стек:** Next.js 16 (App Router, Tailwind CSS 4) · Express 5 + TypeScript · JSON-файл как хранилище.

## Возможности

- `/cards` — общий список всех карточек; добавление карточки через форму в попапе (название, ссылка на изображение, выбор коллекций и персонажей), фильтр по персонажам.
- `/collection` — список коллекций; создание коллекции через форму в попапе (название).
- `/collection/{название}` — карточки выбранной коллекции с фильтром по персонажам.
- `/cards/{название}` — страница карточки: изображение, коллекции, персонажи, редактирование и удаление.
- Одна карточка может входить в любое количество коллекций и отображается и в общем списке, и в каждом из своих коллекционных разделов.
- Персонажи выбираются из справочника или создаются на месте (ввод через запятую или Enter); отдельной страницы у них нет.
- Бэкенда «в облаке» нет: данные хранятся в локальном JSON-файле `backend/data/db.json`.

## Структура

```
card-collector/
├── backend/                # Express API (TypeScript, tsx)
│   ├── data/db.example.json # пример базы для первого запуска
│   ├── data/db.json        # хранилище данных (создаётся локально, не в репозитории)
│   └── src/
│       ├── server.ts       # точка входа, /api/*
│       ├── db.ts           # чтение/запись JSON-базы
│       ├── types.ts        # Card, Collection, Character
│       └── routes/         # cards.ts, collections.ts, characters.ts
├── frontend/               # Next.js 16 (FSD-слои)
│   ├── app/                # роутинг
│   ├── widgets/            # шапка, подвал
│   ├── features/           # add-card, create-collection (формы в попапах)
│   ├── entities/           # card, collection
│   └── shared/             # ui, lib, config
├── package.json            # корневые скрипты (concurrently)
└── ARCHITECTURE.md         # описание архитектуры
```

## Запуск

```bash
npm install                 # зависимости корня (concurrently)
cd backend && npm install   # backend (не используйте `npm --prefix backend install`: npm добавит корень как зависимость)
cd ..
npm run dev                 # backend: http://localhost:4000, frontend: http://localhost:3000
```

Откройте http://localhost:3000. Фронтенд ходит в API через прокси `/api/*` (см. `frontend/next.config.ts`).

Продакшен-сборка: `npm run build`, запуск: `npm start`.

## API

| Метод | Путь                          | Описание                                                       |
| ----- | ----------------------------- | -------------------------------------------------------------- |
| GET   | `/api/health`                 | Проверка доступности                                           |
| GET   | `/api/cards`                  | Все карточки                                                   |
| POST  | `/api/cards`                  | Создать карточку `{ name, imageUrl?, collectionIds?, characterIds?, characterNames? }` (409 при дубликате названия) |
| GET   | `/api/cards/:name`            | Карточка по названию                                           |
| PUT   | `/api/cards/:name`            | Обновить карточку (тело как у POST)                            |
| DELETE| `/api/cards/:name`            | Удалить карточку                                               |
| GET   | `/api/collections`            | Все коллекции с `cardsCount`                                   |
| POST  | `/api/collections`            | Создать коллекцию `{ name }` (409 при дубликате)               |
| GET   | `/api/collections/:name`      | Коллекция с карточками                                         |
| GET   | `/api/characters`             | Все персонажи с `cardsCount`                                   |
| POST  | `/api/characters`             | Создать персонажа `{ name }` (409 при дубликате)               |
| DELETE| `/api/characters/:id`         | Удалить персонажа (с отвязкой от карточек)                     |

Названия карточек и коллекций в путях URL-кодируются (поддерживается кириллица).

## Данные

Данные хранятся в `backend/data/db.json`. Файл не попадает в репозиторий (в нём ваши личные данные), но в проекте есть `backend/data/db.example.json` с демо-набором (коллекции, персонажи, карточки с изображениями picsum.photos). Чтобы начать с демо-данных, скопируйте пример:

```bash
cp backend/data/db.example.json backend/data/db.json
```

Если файла нет, он создастся пустым при первом запуске. Путь к хранилищу переопределяется переменной `DB_PATH`, порт API — `PORT`.
