import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const typography = tv({
  base: ["m-0"],
  variants: {
    variant: {
      body: "font-editor text-sm leading-6 text-text-secondary",
      code: "font-mono text-[13px] text-code-highlight",
      display: "font-mono text-4xl font-bold text-text-primary",
      meta: "font-mono text-xs text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

const sectionTitle = tv({
  slots: {
    root: ["inline-flex items-center gap-2"],
    slash: ["font-mono text-sm font-bold text-accent-green"],
    label: ["font-mono text-sm font-bold text-text-primary"],
  },
});

type TypographyVariants = VariantProps<typeof typography>;

type TypographyProps = ComponentProps<"p"> & TypographyVariants;

type SectionTitleProps = Omit<ComponentProps<"div">, "children"> & {
  children: string;
};

function Typography({ className, variant, ...props }: TypographyProps) {
  return <p className={typography({ className, variant })} {...props} />;
}

function SectionTitle({ children, className, ...props }: SectionTitleProps) {
  const { root, slash, label } = sectionTitle();

  return (
    <div className={root({ className })} {...props}>
      <span className={slash()}>{"//"}</span>
      <span className={label()}>{children}</span>
    </div>
  );
}

export {
  SectionTitle,
  Typography,
  sectionTitle,
  typography,
  type SectionTitleProps,
  type TypographyProps,
  type TypographyVariants,
};
