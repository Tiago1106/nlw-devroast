import { useMemo } from "react";

import {
  LANGUAGE_FALLBACK,
  LANGUAGE_SELECT_AUTO,
  type LanguageSelectValue,
  type SupportedLanguage,
} from "./language-options";

function useResolvedLanguage(
  selectedLanguage: LanguageSelectValue,
  detectedLanguage: SupportedLanguage | null,
) {
  return useMemo(() => {
    if (selectedLanguage !== LANGUAGE_SELECT_AUTO) {
      return selectedLanguage;
    }

    return detectedLanguage ?? LANGUAGE_FALLBACK;
  }, [detectedLanguage, selectedLanguage]);
}

export { useResolvedLanguage };
