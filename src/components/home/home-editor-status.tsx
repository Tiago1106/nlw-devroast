import { cn } from "@/lib/cn";

import {
  LANGUAGE_METADATA,
  LANGUAGE_SELECT_AUTO,
  type LanguageSelectValue,
  type SupportedLanguage,
} from "./language-options";
import type { DetectionReason } from "./use-language-detection";

type HomeEditorStatusProps = {
  className?: string;
  code: string;
  detectedLanguage: SupportedLanguage | null;
  detectionReason: DetectionReason;
  resolvedLanguage: SupportedLanguage;
  selectedLanguage: LanguageSelectValue;
};

function HomeEditorStatus({
  className,
  code,
  detectedLanguage,
  detectionReason,
  resolvedLanguage,
  selectedLanguage,
}: HomeEditorStatusProps) {
  const lineCount = Math.max(1, code.split("\n").length);
  const characterCount = code.length;
  const statusLabel =
    selectedLanguage === LANGUAGE_SELECT_AUTO
      ? detectionReason === "detected" && detectedLanguage
        ? `auto: ${LANGUAGE_METADATA[detectedLanguage].label}`
        : detectionReason === "empty"
          ? `auto: ${LANGUAGE_METADATA[resolvedLanguage].label}`
          : `fallback: ${LANGUAGE_METADATA[resolvedLanguage].label}`
      : `manual: ${LANGUAGE_METADATA[resolvedLanguage].label}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border-primary bg-bg-surface px-4 py-2 font-mono text-[11px] text-text-tertiary",
        className,
      )}
    >
      <span>{statusLabel}</span>
      <span>
        {lineCount} lines / {characterCount} chars
      </span>
    </div>
  );
}

export { HomeEditorStatus, type HomeEditorStatusProps };
