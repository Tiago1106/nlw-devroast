import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const badge = tv({
  slots: {
    root: ["inline-flex items-center gap-2", "font-mono"],
    dot: ["size-2 shrink-0 rounded-full"],
    label: ["text-xs leading-none"],
  },
  variants: {
    variant: {
      critical: {
        dot: "bg-accent-red",
        label: "text-accent-red",
      },
      warning: {
        dot: "bg-accent-amber",
        label: "text-accent-amber",
      },
      good: {
        dot: "bg-accent-green",
        label: "text-accent-green",
      },
      verdict: {
        dot: "bg-accent-red",
        label: "text-[13px] leading-none text-accent-red",
      },
    },
    showDot: {
      false: {
        dot: "hidden",
      },
    },
  },
  defaultVariants: {
    variant: "good",
    showDot: true,
  },
});

type BadgeVariants = VariantProps<typeof badge>;

type BadgeProps = ComponentProps<"span"> &
  BadgeVariants & {
    children: string;
  };

function Badge({
  children,
  className,
  showDot,
  variant,
  ...props
}: BadgeProps) {
  const { root, dot, label } = badge({ showDot, variant });

  return (
    <span className={root({ className })} {...props}>
      <span aria-hidden="true" className={dot()} />
      <span className={label()}>{children}</span>
    </span>
  );
}

export { Badge, badge, type BadgeProps, type BadgeVariants };
