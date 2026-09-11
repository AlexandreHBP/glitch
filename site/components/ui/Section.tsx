import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "title">;

export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
  ...rest
}: SectionProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <section
      id={id}
      className={cn("relative py-20 sm:py-28", className)}
      {...rest}
    >
      <div className="container-section">
        {(eyebrow || title || description) && (
          <header className={cn("mb-14 max-w-2xl", alignment)}>
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl heading-gradient">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-balance text-base text-slate-400 sm:text-lg">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
