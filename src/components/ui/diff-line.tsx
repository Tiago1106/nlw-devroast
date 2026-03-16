import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLine = tv({
  slots: {
    root: [
      "grid w-full grid-cols-[24px_minmax(0,1fr)] items-start gap-0 font-mono text-[13px]",
      "border-b border-border-primary/60 last:border-b-0",
    ],
    prefix: ["flex min-h-9 items-start justify-center pt-2.5 font-bold"],
    code: [
      "min-w-0 overflow-x-auto px-4 py-2.5 whitespace-pre text-text-secondary",
    ],
  },
  variants: {
    variant: {
      added: {
        root: "bg-diff-added/70",
        prefix: "text-accent-green",
        code: "text-text-primary",
      },
      removed: {
        root: "bg-diff-removed/70",
        prefix: "text-accent-red",
        code: "text-text-secondary line-through decoration-accent-red/40 decoration-1",
      },
      context: {
        prefix: "text-text-tertiary",
        code: "text-text-secondary",
      },
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

type DiffLineVariants = VariantProps<typeof diffLine>;

type DiffLineProps = ComponentProps<"div"> &
  DiffLineVariants & {
    children: string;
    prefix?: string;
  };

function DiffLine({
  children,
  className,
  prefix,
  variant,
  ...props
}: DiffLineProps) {
  const { code, prefix: prefixClassName, root } = diffLine({ variant });
  const resolvedPrefix =
    prefix ?? (variant === "added" ? "+" : variant === "removed" ? "-" : " ");

  return (
    <div className={root({ className })} {...props}>
      <span className={prefixClassName()}>{resolvedPrefix}</span>
      <span className={code()}>{children}</span>
    </div>
  );
}

export { DiffLine, diffLine, type DiffLineProps, type DiffLineVariants };
