# Card Collector — Frontend

Next.js 16 (App Router, Turbopack, Tailwind CSS 4) клиент для Card Collector.
Слои организованы по FSD: `app` (роутинг), `widgets`, `features`, `entities`, `shared`.

Инструкция по запуску, обзор возможностей и API — в [корневом README](../README.md).
Описание архитектуры — в [ARCHITECTURE.md](../ARCHITECTURE.md).

## Разработка

Фронтенд обращается к API по относительному пути `/api/*`, который проксируется
на backend (см. `next.config.ts`). Запускать нужно из корня монорепо:

```bash
npm run dev   # backend: http://localhost:4000, frontend: http://localhost:3000
```
