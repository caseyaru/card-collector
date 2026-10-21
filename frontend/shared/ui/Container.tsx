import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Центрирует содержимое и задаёт боковые отступы. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
