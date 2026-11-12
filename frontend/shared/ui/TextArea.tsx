import { useId, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/lib/cn";

interface TextAreaProps
  extends Omit<ComponentPropsWithoutRef<"textarea">, "className"> {
  label: string;
  hint?: string;
  className?: string;
}

/** Многострочное поле ввода с подписью и подсказкой. */
export function TextArea({ label, hint, className, ...rest }: TextAreaProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        id={inputId}
        aria-describedby={hint ? hintId : undefined}
        className={cn(
          "min-h-28 resize-y rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/15",
          className,
        )}
        {...rest}
      />
      {hint ? (
        <span id={hintId} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
