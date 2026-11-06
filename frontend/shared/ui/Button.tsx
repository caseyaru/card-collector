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
    "bg-brand-pink-deep text-white shadow-sm shadow-brand-pink/30 hover:bg-brand-pink-darker",
  secondary:
    "border border-line-strong bg-white text-ink shadow-sm hover:border-brand-lilac hover:bg-lilac-soft",
  ghost:
    "text-ink-soft hover:bg-brand-lilac/25 hover:text-ink",
  danger:
    "border border-red-300 bg-white text-red-600 hover:bg-red-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
};

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-pink",
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
