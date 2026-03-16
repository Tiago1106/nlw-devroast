"use client";

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { useEffect, useState } from "react";

import { LANGUAGE_ALIASES } from "./language-aliases";
import {
  LANGUAGE_DETECTION_SUBSET,
  LANGUAGE_TYPESCRIPT_HINTS,
  type SupportedLanguage,
} from "./language-options";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("php", php);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);

const DETECTION_DEBOUNCE_MS = 250;
const DETECTION_MIN_RELEVANCE = 6;
const DETECTION_MIN_GAP = 2;
const DETECTION_SAMPLE_LIMIT = 20000;

type DetectionReason = "detected" | "empty" | "fallback";

type LanguageDetectionResult = {
  detectedLanguage: SupportedLanguage | null;
  reason: DetectionReason;
};

function detectStrongLanguageHints(sample: string): SupportedLanguage | null {
  if (/^#!.*\b(?:bash|sh)\b/m.test(sample)) {
    return "bash";
  }

  if (/^<\?php/.test(sample)) {
    return "php";
  }

  if (
    (sample.startsWith("{") || sample.startsWith("[")) &&
    tryParseJson(sample)
  ) {
    return "json";
  }

  if (
    /<!doctype html>|<html[\s>]|<body[\s>]|<div[\s>]|<section[\s>]/i.test(
      sample,
    )
  ) {
    return "html";
  }

  if (
    /\bselect\b[\s\S]*\bfrom\b|\binsert\s+into\b|\bupdate\b[\s\S]*\bset\b|\bdelete\s+from\b/i.test(
      sample,
    )
  ) {
    return "sql";
  }

  if (
    /^\s*package\s+main\b/m.test(sample) ||
    /\bfunc\s+[A-Za-z_]\w*\s*\(/.test(sample)
  ) {
    return "go";
  }

  if (
    /\bfn\s+[A-Za-z_]\w*\s*\(/.test(sample) ||
    /\bprintln!\s*\(/.test(sample)
  ) {
    return "rust";
  }

  if (/\bpublic\s+class\s+[A-Z]\w*|\bSystem\.out\.println\s*\(/.test(sample)) {
    return "java";
  }

  if (
    /^\s*def\s+[A-Za-z_]\w*\s*\(|^\s*from\s+[A-Za-z_.]+\s+import\s+/m.test(
      sample,
    )
  ) {
    return "python";
  }

  if (/^[.#]?[-_a-zA-Z][\w-]*\s*\{[\s\S]*:[\s\S]*;[\s\S]*\}/m.test(sample)) {
    return "css";
  }

  return null;
}

function tryParseJson(sample: string) {
  try {
    JSON.parse(sample);
    return true;
  } catch {
    return false;
  }
}

function hasTypeScriptHints(sample: string) {
  return LANGUAGE_TYPESCRIPT_HINTS.some((pattern) => pattern.test(sample));
}

function resolveJsxFamily(
  language: SupportedLanguage,
  sample: string,
): SupportedLanguage {
  const hasJsxSyntax =
    /<[A-Za-z][\w:-]*(\s[^>]*)?>/.test(sample) &&
    /<\/[A-Za-z][\w:-]*>/.test(sample);

  if (!hasJsxSyntax) {
    return language;
  }

  if (language === "javascript") {
    return "jsx";
  }

  if (language === "typescript") {
    return "tsx";
  }

  return language;
}

function normalizeDetectedLanguage(rawLanguage: string, sample: string) {
  const normalized = LANGUAGE_ALIASES[rawLanguage];

  if (!normalized) {
    return null;
  }

  return resolveJsxFamily(normalized, sample);
}

function resolveHtmlFamily(sample: string) {
  const hasClosingTag = /<\/[A-Za-z][\w:-]*>/.test(sample);
  const hasJsExpression = /\{[^}]+\}/.test(sample);
  const hasTypeScript = hasTypeScriptHints(sample);

  if (!hasClosingTag) {
    return null;
  }

  if (hasJsExpression) {
    return hasTypeScript ? "tsx" : "jsx";
  }

  return "html";
}

function resolveJavaScriptFamily(sample: string) {
  const hasJsxLikeMarkup = /<[A-Za-z][\w:-]*(\s[^>]*)?>/.test(sample);

  if (hasJsxLikeMarkup) {
    return hasTypeScriptHints(sample) ? "tsx" : "jsx";
  }

  return hasTypeScriptHints(sample) ? "typescript" : "javascript";
}

function inferLanguage(code: string): LanguageDetectionResult {
  const sample = code.trim().slice(0, DETECTION_SAMPLE_LIMIT);

  if (!sample) {
    return {
      detectedLanguage: null,
      reason: "empty",
    };
  }

  const stronglyDetectedLanguage = detectStrongLanguageHints(sample);

  if (stronglyDetectedLanguage) {
    return {
      detectedLanguage: stronglyDetectedLanguage,
      reason: "detected",
    };
  }

  const result = hljs.highlightAuto(sample, [...LANGUAGE_DETECTION_SUBSET]);
  let normalizedLanguage = result.language
    ? normalizeDetectedLanguage(result.language, sample)
    : null;

  if (normalizedLanguage === "html") {
    normalizedLanguage = resolveHtmlFamily(sample) ?? normalizedLanguage;
  }

  if (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "typescript"
  ) {
    normalizedLanguage = resolveJavaScriptFamily(sample);
  }

  const secondBestRelevance = result.secondBest?.relevance ?? 0;
  const relevanceGap = result.relevance - secondBestRelevance;
  const hasConfidence =
    result.relevance >= DETECTION_MIN_RELEVANCE ||
    (result.relevance >= DETECTION_MIN_GAP &&
      relevanceGap >= DETECTION_MIN_GAP);

  if (!normalizedLanguage || !hasConfidence) {
    return {
      detectedLanguage: null,
      reason: "fallback",
    };
  }

  return {
    detectedLanguage: normalizedLanguage,
    reason: "detected",
  };
}

function useLanguageDetection(code: string, enabled: boolean) {
  const [result, setResult] = useState<LanguageDetectionResult>({
    detectedLanguage: null,
    reason: code.trim() ? "fallback" : "empty",
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResult(inferLanguage(code));
    }, DETECTION_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [code, enabled]);

  return result;
}

export {
  useLanguageDetection,
  type DetectionReason,
  type LanguageDetectionResult,
};
