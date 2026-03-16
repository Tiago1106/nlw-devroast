import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { Badge } from "@/components/ui/badge";

const card = tv({
  slots: {
    root: [
      "flex w-full flex-col gap-3 border border-border-primary bg-bg-surface p-5",
    ],
    title: ["font-mono text-[13px] text-text-primary"],
    description: ["font-editor text-xs leading-6 text-text-secondary"],
  },
  variants: {
    variant: {
      critical: {},
      warning: {},
      good: {},
      verdict: {},
    },
  },
  defaultVariants: {
    variant: "critical",
  },
});

type CardVariants = VariantProps<typeof card>;

type CardProps = Omit<ComponentProps<"article">, "title"> &
  CardVariants & {
    description: string;
    statusLabel?: string;
    title: string;
  };

function Card({
  className,
  description,
  statusLabel,
  title,
  variant,
  ...props
}: CardProps) {
  const {
    root,
    title: titleClassName,
    description: descriptionClassName,
  } = card({
    variant,
  });

  return (
    <article className={root({ className })} {...props}>
      <Badge variant={variant}>{statusLabel ?? variant ?? "critical"}</Badge>
      <p className={titleClassName()}>{title}</p>
      <p className={descriptionClassName()}>{description}</p>
    </article>
  );
}

export { Card, card, type CardProps, type CardVariants };
