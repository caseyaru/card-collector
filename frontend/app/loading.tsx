import { Container } from "@/shared/ui";

/** Состояние загрузки сегмента. */
export default function Loading() {
  return (
    <Container className="flex flex-1 items-center justify-center py-20">
      <div
        role="status"
        aria-label="Загрузка"
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
      />
    </Container>
  );
}
