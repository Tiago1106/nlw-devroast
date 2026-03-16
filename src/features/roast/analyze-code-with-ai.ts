import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import type { RoastAnalysisResult, RoastMode } from "./types";

const roastIssueSeveritySchema = z.enum(["critical", "warning", "good"]);
const roastVerdictSchema = z.enum([
  "needs_serious_help",
  "needs_attention",
  "actually_good",
]);
const roastDiffLineKindSchema = z.enum(["context", "removed", "added"]);

const roastAnalysisSchema = z.object({
  diffLines: z
    .array(
      z.object({
        content: z.string().min(1).max(400),
        kind: roastDiffLineKindSchema,
        newLineNumber: z.number().int().positive().optional(),
        oldLineNumber: z.number().int().positive().optional(),
      }),
    )
    .min(1)
    .max(8),
  headline: z.string().min(12).max(180),
  issues: z
    .array(
      z.object({
        description: z.string().min(16).max(260),
        severity: roastIssueSeveritySchema,
        title: z.string().min(4).max(80),
      }),
    )
    .min(2)
    .max(4),
  score: z.number().min(1).max(9.9),
  scoreLabel: roastIssueSeveritySchema,
  summary: z.string().min(20).max(220),
  verdict: roastVerdictSchema,
});

const DEVROAST_STYLE_GUIDE = [
  "Voice: monospace terminal operator with sharp engineering humor.",
  "Tone: witty, confident, concise, never random or mean without technical substance.",
  "Every roast must mention concrete code problems, tradeoffs, or maintainability risks.",
  "Avoid filler like 'this code is bad' without specifics.",
  "Avoid emojis, internet slang, and generic AI phrasing.",
  "Issue titles must be lowercase and compact, like CLI diagnostics.",
  "Issue descriptions must sound like actionable roast notes from a strong senior engineer.",
  "Headlines should feel memorable, punchy, and product-ready.",
  "Summaries must read like a short verdict after a terminal scan.",
].join(" ");

const FULL_ROAST_INSTRUCTIONS = [
  "Full roast mode can be more sarcastic and theatrical, but still grounded in real engineering feedback.",
  "Use stronger humor, but keep it useful.",
].join(" ");

const STANDARD_ROAST_INSTRUCTIONS = [
  "Standard mode should be drier and more surgical.",
  "Keep the humor lighter and the advice more direct.",
].join(" ");

function normalizeIssueTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function normalizeSentence(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, maxLength);

  return normalized.endsWith(".") || normalized.endsWith("!")
    ? normalized
    : `${normalized}.`;
}

function clampScore(score: number) {
  return Number(Math.max(1, Math.min(9.9, score)).toFixed(1));
}

function getScoreLabel(score: number): RoastAnalysisResult["scoreLabel"] {
  if (score < 4) {
    return "critical";
  }

  if (score < 7) {
    return "warning";
  }

  return "good";
}

function getVerdict(score: number): RoastAnalysisResult["verdict"] {
  if (score < 4) {
    return "needs_serious_help";
  }

  if (score < 7) {
    return "needs_attention";
  }

  return "actually_good";
}

function normalizeDiffLines(output: z.infer<typeof roastAnalysisSchema>) {
  const normalized = output.diffLines.map((line) => ({
    content: line.content.trim().slice(0, 400),
    kind: line.kind,
    newLineNumber: line.newLineNumber,
    oldLineNumber: line.oldLineNumber,
  }));

  return normalized.length
    ? normalized
    : [{ content: "// no diff generated", kind: "context" as const }];
}

function normalizeAiRoastOutput(output: z.infer<typeof roastAnalysisSchema>) {
  const score = clampScore(output.score);

  return {
    diffLines: normalizeDiffLines(output),
    headline: normalizeSentence(output.headline, 180),
    issues: output.issues.slice(0, 4).map((issue) => ({
      description: normalizeSentence(issue.description, 260),
      severity: issue.severity,
      title: normalizeIssueTitle(issue.title) || "runtime embarrassment",
    })),
    score,
    scoreLabel: getScoreLabel(score),
    summary: normalizeSentence(output.summary, 220),
    verdict: getVerdict(score),
  };
}

function isAiRoastConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function analyzeCodeWithAi(
  sourceCode: string,
  language: string,
  roastMode: RoastMode,
): Promise<RoastAnalysisResult> {
  const modelName = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const trimmedSource = sourceCode.trim();
  const lineCount = trimmedSource.split("\n").length;
  const tone =
    roastMode === "full_roast"
      ? FULL_ROAST_INSTRUCTIONS
      : STANDARD_ROAST_INSTRUCTIONS;

  const { output } = await generateText({
    model: openai(modelName),
    system: [
      "You are Devroast, an expert code reviewer embedded inside a sarcastic terminal UI.",
      DEVROAST_STYLE_GUIDE,
      tone,
      "Return structured JSON only.",
      "Focus on realistic engineering feedback, not generic roast lines.",
      "Keep issue titles concise and issue descriptions practical.",
      "The diff should suggest one meaningful improvement and can include context lines.",
      "Use score from 1.0 to 9.9, where lower is worse.",
      "Score and verdict must align: critical for truly rough code, warning for mixed quality, good only when the snippet is solid.",
      "Do not praise weak code just to sound balanced.",
    ].join(" "),
    prompt: [
      `Language: ${language}`,
      `Mode: ${roastMode}`,
      `Line count: ${lineCount}`,
      "Analyze the code below and return a roast result.",
      "Code:",
      "```",
      trimmedSource,
      "```",
    ].join("\n"),
    output: Output.object({
      schema: roastAnalysisSchema,
    }),
  });
  const normalized = normalizeAiRoastOutput(output);

  return {
    diffLines: normalized.diffLines,
    headline: normalized.headline,
    issues: normalized.issues,
    language,
    lineCount,
    roastMode,
    score: normalized.score,
    scoreLabel: normalized.scoreLabel,
    sourceCode: trimmedSource,
    summary: normalized.summary,
    verdict: normalized.verdict,
  };
}

export { analyzeCodeWithAi, isAiRoastConfigured };
