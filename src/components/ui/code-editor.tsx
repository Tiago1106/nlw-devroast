"use client";

import type { ComponentProps } from "react";
import { useMemo } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const codeEditor = tv({
  slots: {
    root: ["overflow-hidden border border-border-primary bg-bg-input"],
    header: [
      "flex h-10 items-center gap-3 border-b border-border-primary px-4 font-mono text-xs text-text-tertiary",
    ],
    windowDots: ["flex items-center gap-3"],
    body: ["flex w-full"],
    lineNumbers: [
      "flex w-12 shrink-0 flex-col items-end gap-2 border-r border-border-primary bg-bg-surface px-3 py-4 font-mono text-xs text-text-tertiary",
    ],
    textarea: [
      "min-h-[360px] w-full resize-none bg-bg-input px-4 py-4 font-mono text-xs leading-5 text-text-primary outline-none placeholder:text-text-tertiary",
    ],
  },
  variants: {
    showLineNumbers: {
      false: {},
    },
  },
  defaultVariants: {
    showLineNumbers: true,
  },
});

type CodeEditorVariants = VariantProps<typeof codeEditor>;

type CodeEditorProps = Omit<ComponentProps<"textarea">, "children"> &
  CodeEditorVariants & {
    filename?: string;
    hideHeader?: boolean;
    placeholder?: string;
    value: string;
  };

function CodeEditor({
  className,
  filename = "snippet.ts",
  hideHeader = false,
  placeholder = "// paste your code here...",
  showLineNumbers = true,
  value,
  ...props
}: CodeEditorProps) {
  const { root, header, windowDots, body, lineNumbers, textarea } = codeEditor({
    showLineNumbers,
  });
  const lineNumbersList = useMemo(
    () =>
      Array.from({ length: value.split("\n").length }, (_, index) =>
        String(index + 1),
      ),
    [value],
  );

  return (
    <div className={root()}>
      {hideHeader ? null : (
        <div className={header()}>
          <div className={windowDots()}>
            <span className="size-2.5 rounded-full bg-accent-red" />
            <span className="size-2.5 rounded-full bg-accent-amber" />
            <span className="size-2.5 rounded-full bg-accent-green" />
          </div>
          <div className="h-px flex-1 bg-transparent" />
          <span>{filename}</span>
        </div>
      )}

      <div className={body()}>
        {showLineNumbers ? (
          <div className={lineNumbers()}>
            {lineNumbersList.map((lineNumber) => (
              <span key={lineNumber}>{lineNumber}</span>
            ))}
          </div>
        ) : null}

        <textarea
          className={textarea({ className })}
          placeholder={placeholder}
          spellCheck={false}
          value={value}
          {...props}
        />
      </div>
    </div>
  );
}

export {
  CodeEditor,
  codeEditor,
  type CodeEditorProps,
  type CodeEditorVariants,
};
