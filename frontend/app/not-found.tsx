import { Button, Container } from "@/shared/ui";

/** Страница 404. */
export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">404</p>
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Проверьте адрес или вернитесь на главную.
      </p>
      <Button href="/">На главную</Button>
    </Container>
  );
}
