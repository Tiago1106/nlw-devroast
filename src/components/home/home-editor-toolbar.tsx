import { HomeLanguageSelect } from "./home-language-select";
import {
  LANGUAGE_METADATA,
  type LanguageSelectValue,
  type SupportedLanguage,
} from "./language-options";

type HomeEditorToolbarProps = {
  onLanguageChange: (value: LanguageSelectValue) => void;
  resolvedLanguage: SupportedLanguage;
  selectedLanguage: LanguageSelectValue;
};

function HomeEditorToolbar({
  onLanguageChange,
  resolvedLanguage,
  selectedLanguage,
}: HomeEditorToolbarProps) {
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-3 border-b border-border-primary bg-bg-input px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="size-2.5 rounded-full bg-accent-red" />
        <span className="size-2.5 rounded-full bg-accent-amber" />
        <span className="size-2.5 rounded-full bg-accent-green" />
      </div>

      <div className="h-px flex-1 bg-transparent" />

      <span className="font-mono text-xs text-text-tertiary">
        snippet{LANGUAGE_METADATA[resolvedLanguage].extension}
      </span>

      <div className="h-px flex-1 bg-transparent" />

      <HomeLanguageSelect
        onValueChange={onLanguageChange}
        value={selectedLanguage}
      />
    </div>
  );
}

export { HomeEditorToolbar, type HomeEditorToolbarProps };
