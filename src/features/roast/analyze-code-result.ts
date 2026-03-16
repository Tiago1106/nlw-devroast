import { analyzeCodeHeuristic } from "./analyze-code";
import { analyzeCodeWithAi, isAiRoastConfigured } from "./analyze-code-with-ai";
import type { RoastAnalysisResult, RoastIssue, RoastMode } from "./types";

function ensureMinimumIssueCount(result: RoastAnalysisResult) {
  if (result.issues.length >= 2) {
    return result;
  }

  const fallbackIssue: RoastIssue = {
    description:
      "The snippet survives the first pass, but it still wants a second review before anyone calls it clean.",
    severity: result.score < 7 ? "warning" : "good",
    title: result.score < 7 ? "needs one more pass" : "decent enough baseline",
  };

  return {
    ...result,
    issues: [...result.issues, fallbackIssue],
  };
}

async function analyzeCodeResult(
  sourceCode: string,
  language: string,
  roastMode: RoastMode,
): Promise<RoastAnalysisResult> {
  if (!isAiRoastConfigured()) {
    return ensureMinimumIssueCount(
      analyzeCodeHeuristic(sourceCode, language, roastMode),
    );
  }

  try {
    return ensureMinimumIssueCount(
      await analyzeCodeWithAi(sourceCode, language, roastMode),
    );
  } catch {
    return ensureMinimumIssueCount(
      analyzeCodeHeuristic(sourceCode, language, roastMode),
    );
  }
}

export { analyzeCodeResult };
