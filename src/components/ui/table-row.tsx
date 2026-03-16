import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const tableRow = tv({
  slots: {
    root: [
      "grid w-full grid-cols-[40px_60px_minmax(0,1fr)_100px] items-center gap-6 border-b border-border-primary px-5 py-4",
      "font-mono",
    ],
    rank: ["text-[13px] text-text-tertiary"],
    score: ["text-[13px] font-bold"],
    preview: ["truncate text-xs text-text-secondary"],
    language: ["text-xs text-text-tertiary"],
  },
  variants: {
    scoreTone: {
      critical: {
        score: "text-accent-red",
      },
      warning: {
        score: "text-accent-amber",
      },
      good: {
        score: "text-accent-green",
      },
    },
  },
  defaultVariants: {
    scoreTone: "critical",
  },
});

type TableRowVariants = VariantProps<typeof tableRow>;

type TableRowProps = ComponentProps<"div"> &
  TableRowVariants & {
    language: string;
    preview: string;
    rank: string;
    score: string;
  };

function TableRow({
  className,
  language,
  preview,
  rank,
  score,
  scoreTone,
  ...props
}: TableRowProps) {
  const {
    root,
    rank: rankClassName,
    score: scoreClassName,
    preview: previewClassName,
    language: languageClassName,
  } = tableRow({ scoreTone });

  return (
    <div className={root({ className })} {...props}>
      <span className={rankClassName()}>{rank}</span>
      <span className={scoreClassName()}>{score}</span>
      <span className={previewClassName()}>{preview}</span>
      <span className={languageClassName()}>{language}</span>
    </div>
  );
}

export { TableRow, tableRow, type TableRowProps, type TableRowVariants };
