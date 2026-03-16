"use client";

import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import type { Extension } from "@codemirror/state";
import { placeholder } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";

import { HomeEditorStatus } from "./home-editor-status";
import { homeEditorTheme } from "./home-editor-theme";
import { HomeEditorToolbar } from "./home-editor-toolbar";
import {
  LANGUAGE_SELECT_AUTO,
  type LanguageSelectValue,
  type SupportedLanguage,
} from "./language-options";
import { useLanguageDetection } from "./use-language-detection";
import { useResolvedLanguage } from "./use-resolved-language";

type HomeCodeEditorProps = {
  onChange: (value: string) => void;
  onResolvedLanguageChange?: (value: SupportedLanguage) => void;
  value: string;
};

function getLanguageExtension(language: SupportedLanguage): Extension {
  switch (language) {
    case "bash":
      return StreamLanguage.define(shell);
    case "css":
      return css();
    case "go":
      return go();
    case "html":
      return html();
    case "java":
      return java();
    case "javascript":
      return javascript();
    case "json":
      return json();
    case "jsx":
      return javascript({ jsx: true });
    case "php":
      return php();
    case "python":
      return python();
    case "rust":
      return rust();
    case "sql":
      return sql();
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "typescript":
      return javascript({ typescript: true });
  }
}

function HomeCodeEditor({
  onChange,
  onResolvedLanguageChange,
  value,
}: HomeCodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageSelectValue>(LANGUAGE_SELECT_AUTO);
  const { detectedLanguage, reason } = useLanguageDetection(
    value,
    selectedLanguage === LANGUAGE_SELECT_AUTO,
  );
  const resolvedLanguage = useResolvedLanguage(
    selectedLanguage,
    detectedLanguage,
  );
  const extensions = useMemo(
    () => [
      getLanguageExtension(resolvedLanguage),
      placeholder("// paste your code here..."),
      ...homeEditorTheme,
    ],
    [resolvedLanguage],
  );

  useEffect(() => {
    onResolvedLanguageChange?.(resolvedLanguage);
  }, [onResolvedLanguageChange, resolvedLanguage]);

  return (
    <div className="overflow-hidden border border-border-primary bg-bg-input">
      <HomeEditorToolbar
        onLanguageChange={setSelectedLanguage}
        resolvedLanguage={resolvedLanguage}
        selectedLanguage={selectedLanguage}
      />

      <CodeMirror
        basicSetup={{
          allowMultipleSelections: false,
          dropCursor: false,
          foldGutter: false,
          highlightActiveLine: true,
          highlightSelectionMatches: false,
          indentOnInput: true,
        }}
        className="home-code-editor"
        extensions={extensions}
        height="420px"
        onChange={onChange}
        value={value}
      />

      <HomeEditorStatus
        code={value}
        detectedLanguage={detectedLanguage}
        detectionReason={reason}
        resolvedLanguage={resolvedLanguage}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}

export { HomeCodeEditor, type HomeCodeEditorProps };
