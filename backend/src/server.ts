import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { cardsRouter } from "./routes/cards.js";
import { charactersRouter } from "./routes/characters.js";
import { collectionsRouter } from "./routes/collections.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/cards", cardsRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/characters", charactersRouter);

// Неизвестные маршруты.
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Маршрут не найден: ${req.method} ${req.path}` });
});

// Обработчик ошибок (в том числе некорректный JSON).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Некорректный JSON в теле запроса" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Card Collector API: http://localhost:${port}/api`);
});
