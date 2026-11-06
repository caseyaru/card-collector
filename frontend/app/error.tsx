"use client";

import { useEffect } from "react";
import { Button, Container } from "@/shared/ui";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Что-то пошло не так</h1>
      <p className="max-w-md text-sm leading-6 text-muted">
        Не удалось загрузить страницу. Попробуйте ещё раз.
      </p>
      <Button onClick={reset}>Повторить</Button>
    </Container>
  );
}
