import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const navbar = tv({
  slots: {
    root: ["w-full border-b border-border-primary bg-bg-page"],
    inner: [
      "mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6",
    ],
    brand: ["inline-flex items-center gap-2"],
    prompt: ["font-mono text-xl font-bold text-accent-green"],
    name: ["font-mono text-lg font-medium text-text-primary"],
    link: ["font-mono text-[13px] text-text-secondary"],
  },
});

type NavbarVariants = VariantProps<typeof navbar>;

type NavbarProps = Omit<ComponentProps<"header">, "children"> &
  NavbarVariants & {
    brandLabel?: string;
    linkLabel?: string;
  };

function Navbar({
  brandLabel = "devroast",
  className,
  linkLabel = "leaderboard",
  ...props
}: NavbarProps) {
  const { root, inner, brand, prompt, name, link } = navbar();

  return (
    <header className={root({ className })} {...props}>
      <div className={inner()}>
        <div className={brand()}>
          <span className={prompt()}>&gt;</span>
          <span className={name()}>{brandLabel}</span>
        </div>
        <span className={link()}>{linkLabel}</span>
      </div>
    </header>
  );
}

export { Navbar, navbar, type NavbarProps, type NavbarVariants };
