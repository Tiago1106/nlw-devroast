import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const scoreRing = tv({
  slots: {
    root: ["relative inline-grid shrink-0 place-items-center font-mono"],
    track: ["absolute inset-0 rounded-full border-4 border-border-primary"],
    progress: ["absolute inset-0 rounded-full"],
    value: ["text-5xl font-bold leading-none text-text-primary"],
    max: ["text-base leading-none text-text-tertiary"],
  },
  variants: {
    size: {
      sm: {
        track: "border-[3px]",
        value: "text-3xl",
        max: "text-sm",
      },
      md: {
        value: "text-4xl",
        max: "text-sm",
      },
      lg: {},
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

type ScoreRingVariants = VariantProps<typeof scoreRing>;

type ScoreRingProps = Omit<ComponentProps<"div">, "children"> &
  ScoreRingVariants & {
    max?: number;
    value: number;
  };

const SCORE_RING_SIZES = {
  lg: 180,
  md: 160,
  sm: 120,
} as const;

const SCORE_RING_STROKES = {
  lg: 4,
  md: 4,
  sm: 3,
} as const;

function ScoreRing({
  className,
  max = 10,
  size = "lg",
  value,
  ...props
}: ScoreRingProps) {
  const diameter = SCORE_RING_SIZES[size];
  const strokeWidth = SCORE_RING_STROKES[size];
  const progress = Math.max(0, Math.min(1, value / max));
  const {
    root,
    track,
    progress: progressClassName,
    value: valueClassName,
    max: maxClassName,
  } = scoreRing({ size });
  const progressStop = `${Math.max(progress * 100, 0)}%`;
  const progressMask = `radial-gradient(farthest-side, transparent calc(100% - ${strokeWidth}px), #000 calc(100% - ${strokeWidth}px))`;

  return (
    <div
      className={root({ className })}
      style={{ height: diameter, width: diameter }}
      {...props}
    >
      <div className={track()} style={{ height: diameter, width: diameter }} />
      <div
        className={progressClassName()}
        style={{
          background: `conic-gradient(from 0deg, var(--color-accent-green) 0%, var(--color-accent-amber) ${progressStop}, transparent calc(${progressStop} + 1%), transparent 100%)`,
          height: diameter,
          mask: progressMask,
          WebkitMask: progressMask,
          width: diameter,
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-0.5">
        <span className={valueClassName()}>{value.toFixed(1)}</span>
        <span className={maxClassName()}>{`/${max}`}</span>
      </div>
    </div>
  );
}

export { ScoreRing, scoreRing, type ScoreRingProps, type ScoreRingVariants };
