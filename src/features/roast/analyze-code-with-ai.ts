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
      ? "lean into sharp humor and brutal honesty"
      : "be direct and witty, but prioritize actionable feedback";

  const { output } = await generateText({
    model: openai(modelName),
    system: [
      "You are Devroast, an expert code reviewer with terminal-style humor.",
      `For this run, ${tone}.`,
      "Return structured JSON only.",
      "Focus on realistic engineering feedback, not generic roast lines.",
      "Keep issue titles concise and issue descriptions practical.",
      "The diff should suggest one meaningful improvement and can include context lines.",
      "Use score from 1.0 to 9.9, where lower is worse.",
    ].join(" "),
    prompt: [
      `Language: ${language}`,
      `Mode: ${roastMode}`,
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

  return {
    diffLines: output.diffLines,
    headline: output.headline,
    issues: output.issues,
    language,
    lineCount,
    roastMode,
    score: Number(output.score.toFixed(1)),
    scoreLabel: output.scoreLabel,
    sourceCode: trimmedSource,
    summary: output.summary,
    verdict: output.verdict,
  };
}

export { analyzeCodeWithAi, isAiRoastConfigured };
