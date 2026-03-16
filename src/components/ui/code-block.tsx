import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { JSX } from "react";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import type { BundledLanguage } from "shiki";
import { codeToHast } from "shiki";
import { tv, type VariantProps } from "tailwind-variants";

const codeBlock = tv({
  slots: {
    root: ["overflow-hidden border border-border-primary bg-bg-input"],
    header: [
      "flex h-10 items-center gap-3 border-b border-border-primary px-4 font-mono text-xs text-text-tertiary",
    ],
    windowDots: ["flex items-center gap-3"],
    body: ["flex w-full"],
    lineNumbers: [
      "flex w-10 shrink-0 flex-col items-end gap-1.5 border-r border-border-primary bg-bg-surface px-[10px] py-3 font-mono text-[13px] text-text-tertiary",
    ],
    code: ["ui-code-block min-w-0 flex-1 overflow-x-auto bg-bg-input"],
  },
  variants: {
    showLineNumbers: {
      false: {
        code: "w-full",
      },
    },
  },
  defaultVariants: {
    showLineNumbers: true,
  },
});

type CodeBlockVariants = VariantProps<typeof codeBlock>;

type CodeBlockProps = CodeBlockVariants & {
  className?: string;
  code: string;
  filename?: string;
  hideHeader?: boolean;
  lang: BundledLanguage;
};

async function CodeBlock({
  className,
  code,
  filename = "snippet.ts",
  hideHeader = false,
  lang,
  showLineNumbers = true,
}: CodeBlockProps) {
  const {
    root,
    header,
    windowDots,
    body,
    lineNumbers,
    code: codeClassName,
  } = codeBlock({
    showLineNumbers,
  });
  const lineNumbersList = Array.from(
    { length: code.split("\n").length },
    (_, index) => String(index + 1),
  );
  const hast = await codeToHast(code, {
    lang,
    theme: "vesper",
  });
  const highlightedCode = toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
  }) as JSX.Element;

  return (
    <div className={root({ className })}>
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

        <div className={codeClassName()}>{highlightedCode}</div>
      </div>
    </div>
  );
}

export { CodeBlock, codeBlock, type CodeBlockProps, type CodeBlockVariants };
