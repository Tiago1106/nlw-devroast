"use client";

import { cn } from "@/lib/cn";

import {
  LANGUAGE_SELECT_OPTIONS,
  type LanguageSelectValue,
} from "./language-options";

type HomeLanguageSelectProps = {
  className?: string;
  onValueChange: (value: LanguageSelectValue) => void;
  value: LanguageSelectValue;
};

function HomeLanguageSelect({
  className,
  onValueChange,
  value,
}: HomeLanguageSelectProps) {
  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
        lang
      </span>
      <select
        className="min-w-[140px] border border-border-primary bg-bg-elevated px-3 py-2 font-mono text-xs text-text-primary outline-none transition-colors focus:border-border-focus"
        onChange={(event) =>
          onValueChange(event.target.value as LanguageSelectValue)
        }
        value={value}
      >
        {LANGUAGE_SELECT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export { HomeLanguageSelect, type HomeLanguageSelectProps };
