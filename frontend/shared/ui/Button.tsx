import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
}

interface ButtonNativeProps
  extends ButtonBaseProps,
    Omit<ComponentPropsWithoutRef<"button">, "children" | "className"> {
  href?: undefined;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  secondary:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger:
    "border border-red-300 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
};

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

/** Кнопка-ссылка, когда передан `href`, иначе — обычный `<button>`. */
export function Button(props: ButtonLinkProps | ButtonNativeProps) {
  const { variant = "primary", size = "md", children, className } = props;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes(variant, size, className)}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, ...rest } = props as ButtonNativeProps;
  void _variant;
  void _size;

  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
