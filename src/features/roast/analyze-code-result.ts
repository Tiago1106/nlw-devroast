import { analyzeCodeHeuristic } from "./analyze-code";
import { analyzeCodeWithAi, isAiRoastConfigured } from "./analyze-code-with-ai";
import type { RoastAnalysisResult, RoastMode } from "./types";

async function analyzeCodeResult(
  sourceCode: string,
  language: string,
  roastMode: RoastMode,
): Promise<RoastAnalysisResult> {
  if (!isAiRoastConfigured()) {
    return analyzeCodeHeuristic(sourceCode, language, roastMode);
  }

  try {
    return await analyzeCodeWithAi(sourceCode, language, roastMode);
  } catch {
    return analyzeCodeHeuristic(sourceCode, language, roastMode);
  }
}

export { analyzeCodeResult };
