import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const homeEditorTheme = [
  EditorView.theme(
    {
      "&": {
        backgroundColor: "var(--color-bg-input)",
        color: "var(--color-text-primary)",
        backgroundImage:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-bg-elevated) 40%, transparent), transparent)",
        boxShadow:
          "inset 0 1px 0 color-mix(in srgb, var(--color-border-primary) 60%, transparent)",
        fontFamily: "var(--font-editor)",
        fontSize: "13px",
        height: "420px",
      },
      "&.cm-focused": {
        outline: "none",
      },
      ".cm-scroller": {
        fontFamily: "var(--font-editor)",
        lineHeight: "1.6",
        overflow: "auto",
      },
      ".cm-content": {
        caretColor: "var(--color-accent-green)",
        minHeight: "420px",
        padding: "18px 0",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--color-accent-green)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--color-bg-surface)",
        borderRight: "1px solid var(--color-border-primary)",
        color: "var(--color-text-tertiary)",
      },
      ".cm-activeLine, .cm-activeLineGutter": {
        backgroundColor:
          "color-mix(in srgb, var(--color-bg-elevated) 45%, transparent)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        minWidth: "24px",
        padding: "0 12px 0 0",
      },
      ".cm-line": {
        padding: "0 16px",
      },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection":
        {
          backgroundColor:
            "color-mix(in srgb, var(--color-accent-green) 22%, transparent)",
        },
      ".cm-placeholder": {
        color: "var(--color-text-tertiary)",
      },
      ".cm-matchingBracket": {
        backgroundColor:
          "color-mix(in srgb, var(--color-accent-green) 16%, transparent)",
        color: "var(--color-text-primary)",
      },
      ".cm-panels": {
        backgroundColor: "var(--color-bg-elevated)",
        color: "var(--color-text-secondary)",
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { color: "var(--color-text-tertiary)", tag: tags.comment },
      { color: "var(--color-accent-cyan)", tag: tags.keyword },
      { color: "var(--color-accent-blue)", tag: tags.operator },
      { color: "var(--color-accent-orange)", tag: tags.string },
      { color: "var(--color-accent-amber)", tag: tags.number },
      { color: "var(--color-accent-green)", tag: tags.bool },
      { color: "var(--color-accent-red)", tag: tags.null },
      { color: "var(--color-text-tertiary)", tag: tags.meta },
      {
        color: "var(--color-code-highlight)",
        tag: tags.function(tags.variableName),
      },
      {
        color: "var(--color-code-highlight)",
        tag: tags.definition(tags.variableName),
      },
      { color: "var(--color-text-primary)", tag: tags.variableName },
      { color: "var(--color-accent-cyan)", tag: tags.propertyName },
      { color: "var(--color-accent-blue)", tag: tags.typeName },
      { color: "var(--color-accent-cyan)", tag: tags.className },
      { color: "var(--color-accent-orange)", tag: tags.tagName },
      { color: "var(--color-accent-amber)", tag: tags.attributeName },
      { color: "var(--color-accent-green)", tag: tags.special(tags.brace) },
      { color: "var(--color-text-secondary)", tag: tags.punctuation },
      { color: "var(--color-accent-red)", tag: tags.invalid },
    ]),
  ),
] satisfies Extension[];

export { homeEditorTheme };
