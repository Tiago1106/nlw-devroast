import type { BundledLanguage } from "shiki";

import { CodeBlock } from "@/components/ui/code-block";
import { SectionTitle } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

import { LANGUAGE_METADATA } from "./language-options";

type RoastCodePreviewProps = {
  className?: string;
  code: string;
  language: string;
};

const SHIKI_LANGUAGE_MAP: Record<string, BundledLanguage> = {
  bash: "bash",
  css: "css",
  go: "go",
  html: "html",
  java: "java",
  javascript: "javascript",
  json: "json",
  jsx: "tsx",
  php: "php",
  python: "python",
  rust: "rust",
  sql: "sql",
  tsx: "tsx",
  typescript: "typescript",
};

function getFilename(language: string) {
  const metadata =
    LANGUAGE_METADATA[language as keyof typeof LANGUAGE_METADATA];

  return `your_submission${metadata?.extension ?? ".txt"}`;
}

function RoastCodePreview({
  className,
  code,
  language,
}: RoastCodePreviewProps) {
  const shikiLanguage = SHIKI_LANGUAGE_MAP[language] ?? "typescript";

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionTitle>your_submission</SectionTitle>
      <CodeBlock
        className="w-full"
        code={code}
        filename={getFilename(language)}
        lang={shikiLanguage}
      />
    </section>
  );
}

export { RoastCodePreview, type RoastCodePreviewProps };
