import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLine = tv({
  slots: {
    root: [
      "inline-flex w-full items-center gap-2 px-4 py-2 font-mono text-[13px]",
    ],
    prefix: ["shrink-0"],
    code: ["min-w-0 truncate"],
  },
  variants: {
    variant: {
      added: {
        root: "bg-diff-added",
        prefix: "text-accent-green",
        code: "text-text-primary",
      },
      removed: {
        root: "bg-diff-removed",
        prefix: "text-accent-red",
        code: "text-text-secondary",
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
  const { root, prefix: prefixClassName, code } = diffLine({ variant });
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
