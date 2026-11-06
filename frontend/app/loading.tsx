import { Container } from "@/shared/ui";

/** Состояние загрузки сегмента. */
export default function Loading() {
  return (
    <Container className="flex flex-1 items-center justify-center py-20">
      <div
        role="status"
        aria-label="Загрузка"
        className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand-pink"
      />
    </Container>
  );
}
