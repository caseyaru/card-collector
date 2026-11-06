"use client";

import {
  useEffect,
  useId,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// Подписка-заглушка и снапшоты для определения, что компонент уже на клиенте
// (портал нельзя рендерить на сервере).
const subscribeNothing = () => () => {};
const getMountedOnClient = () => true;
const getMountedOnServer = () => false;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Модальное окно: портал, закрытие по Escape и по клику на подложку. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const mounted = useSyncExternalStore(
    subscribeNothing,
    getMountedOnClient,
    getMountedOnServer,
  );
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Закрыть диалог"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-ink/40 backdrop-blur-sm"
      />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="pointer-events-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-white p-4 shadow-2xl shadow-ink/10 sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="rounded-full p-1.5 text-muted transition-colors hover:bg-lilac-soft hover:text-ink"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
