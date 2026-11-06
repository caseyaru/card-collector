import { Container } from "@/shared/ui";

/** Подвал приложения: шутливая ссылка на авторство. */
export function AppFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex justify-center py-6 text-sm text-muted">
        <p>
          Собрано из карточек, кофе и щепотки CSS. Авторство —{" "}
          <a
            href="https://github.com/caseyaru"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-pink-deep underline decoration-brand-lilac decoration-2 underline-offset-4 transition-colors hover:text-brand-pink"
          >
            caseyaru
          </a>
          .
        </p>
      </Container>
    </footer>
  );
}
