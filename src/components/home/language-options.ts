const LANGUAGE_OPTIONS = [
  { extension: ".js", label: "JavaScript", value: "javascript" },
  { extension: ".ts", label: "TypeScript", value: "typescript" },
  { extension: ".jsx", label: "JSX", value: "jsx" },
  { extension: ".tsx", label: "TSX", value: "tsx" },
  { extension: ".json", label: "JSON", value: "json" },
  { extension: ".html", label: "HTML", value: "html" },
  { extension: ".css", label: "CSS", value: "css" },
  { extension: ".py", label: "Python", value: "python" },
  { extension: ".sh", label: "Bash", value: "bash" },
  { extension: ".sql", label: "SQL", value: "sql" },
  { extension: ".go", label: "Go", value: "go" },
  { extension: ".rs", label: "Rust", value: "rust" },
  { extension: ".java", label: "Java", value: "java" },
  { extension: ".php", label: "PHP", value: "php" },
] as const;

const LANGUAGE_FALLBACK = "typescript" as const;
const LANGUAGE_SELECT_AUTO = "auto" as const;

const LANGUAGE_SELECT_OPTIONS = [
  { label: "Auto", value: LANGUAGE_SELECT_AUTO },
  ...LANGUAGE_OPTIONS,
] as const;

const LANGUAGE_DETECTION_SUBSET = [
  "javascript",
  "typescript",
  "json",
  "xml",
  "css",
  "python",
  "bash",
  "sql",
  "go",
  "rust",
  "java",
  "php",
] as const;

const LANGUAGE_TYPESCRIPT_HINTS = [
  /\binterface\s+[A-Z]\w*/,
  /\btype\s+[A-Z]\w*\s*=/,
  /\bimplements\s+[A-Z]\w*/,
  /:\s*[A-Z][\w<>,[\]\s|]*/,
  /\breadonly\b/,
  /\bas\s+const\b/,
] as const;

type SupportedLanguage = (typeof LANGUAGE_OPTIONS)[number]["value"];
type LanguageSelectValue = (typeof LANGUAGE_SELECT_OPTIONS)[number]["value"];

const LANGUAGE_METADATA = Object.fromEntries(
  LANGUAGE_OPTIONS.map((language) => [language.value, language]),
) as Record<SupportedLanguage, (typeof LANGUAGE_OPTIONS)[number]>;

export {
  LANGUAGE_DETECTION_SUBSET,
  LANGUAGE_FALLBACK,
  LANGUAGE_METADATA,
  LANGUAGE_OPTIONS,
  LANGUAGE_SELECT_AUTO,
  LANGUAGE_SELECT_OPTIONS,
  LANGUAGE_TYPESCRIPT_HINTS,
  type LanguageSelectValue,
  type SupportedLanguage,
};
