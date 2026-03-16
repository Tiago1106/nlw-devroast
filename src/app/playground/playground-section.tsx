"use client";

import { useState } from "react";

type PlaygroundSectionProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  description: string;
  title: string;
};

function PlaygroundSection({
  children,
  defaultOpen = true,
  description,
  title,
}: PlaygroundSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="flex flex-col gap-4 border border-border-primary bg-bg-surface">
      <button
        className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition-colors duration-150 hover:bg-bg-elevated"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
            {title}
          </h2>
          <p className="max-w-2xl text-sm text-text-secondary">{description}</p>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-accent-green">
          {isOpen ? "collapse" : "expand"}
        </span>
      </button>

      {isOpen ? <div className="px-6 pb-6">{children}</div> : null}
    </section>
  );
}

export { PlaygroundSection, type PlaygroundSectionProps };
