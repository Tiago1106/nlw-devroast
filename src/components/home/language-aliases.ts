import type { SupportedLanguage } from "./language-options";

const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  bash: "bash",
  css: "css",
  go: "go",
  html: "html",
  java: "java",
  javascript: "javascript",
  js: "javascript",
  json: "json",
  php: "php",
  py: "python",
  python: "python",
  rs: "rust",
  rust: "rust",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  ts: "typescript",
  typescript: "typescript",
  xml: "html",
};

export { LANGUAGE_ALIASES };
