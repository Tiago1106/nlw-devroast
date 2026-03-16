"use client";

import { Switch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const toggle = tv({
  slots: {
    root: [
      "inline-flex items-center gap-3",
      "font-mono",
      "transition-colors duration-150",
      "cursor-pointer",
    ],
    control: [
      "flex h-[22px] w-10 shrink-0 items-center rounded-full p-[3px]",
      "transition-colors duration-150",
    ],
    thumb: ["size-4 rounded-full transition-transform duration-150"],
    label: ["text-xs leading-none transition-colors duration-150"],
  },
  variants: {
    checked: {
      true: {
        control: "justify-end bg-accent-green",
        thumb: "bg-bg-page",
        label: "text-accent-green",
      },
      false: {
        control: "justify-start bg-border-primary",
        thumb: "bg-text-secondary",
        label: "text-text-secondary",
      },
    },
    disabled: {
      true: {
        root: "cursor-not-allowed opacity-50",
      },
    },
  },
  defaultVariants: {
    checked: false,
    disabled: false,
  },
});

type ToggleVariants = VariantProps<typeof toggle>;

type ToggleProps = Omit<
  ComponentProps<typeof Switch.Root>,
  "checked" | "children" | "className" | "onCheckedChange"
> &
  ToggleVariants & {
    checked: boolean;
    className?: string;
    label?: string;
    onCheckedChange: (checked: boolean) => void;
  };

function Toggle({
  "aria-label": ariaLabel,
  checked,
  className,
  disabled = false,
  label,
  onCheckedChange,
  ...props
}: ToggleProps) {
  const {
    root,
    control,
    thumb,
    label: labelClassName,
  } = toggle({ checked, disabled });

  return (
    <span className={root({ className })}>
      <Switch.Root
        aria-label={ariaLabel ?? label}
        checked={checked}
        className={control()}
        disabled={disabled}
        onCheckedChange={(nextChecked) => onCheckedChange(nextChecked)}
        {...props}
      >
        <Switch.Thumb className={thumb()} />
      </Switch.Root>
      {label ? <span className={labelClassName()}>{label}</span> : null}
    </span>
  );
}

export { Toggle, toggle, type ToggleProps, type ToggleVariants };
