import { asc, eq } from "drizzle-orm";

import {
  getDb,
  isDatabaseConfigured,
  roastDiffLines,
  roastIssues,
  roastShares,
  roastSubmissions,
} from "@/db";

import type { RoastAnalysisResult } from "./types";

async function getRoastBySlug(
  slug: string,
): Promise<RoastAnalysisResult | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  const [submission] = await db
    .select({
      createdAt: roastSubmissions.createdAt,
      headline: roastSubmissions.headline,
      id: roastSubmissions.id,
      language: roastSubmissions.language,
      lineCount: roastSubmissions.lineCount,
      roastMode: roastSubmissions.roastMode,
      score: roastSubmissions.score,
      scoreLabel: roastSubmissions.scoreLabel,
      shareTitle: roastShares.title,
      shareSlug: roastShares.slug,
      sourceCode: roastSubmissions.sourceCode,
      summary: roastSubmissions.summary,
      verdict: roastSubmissions.verdict,
    })
    .from(roastShares)
    .innerJoin(
      roastSubmissions,
      eq(roastSubmissions.id, roastShares.submissionId),
    )
    .where(eq(roastShares.slug, slug))
    .limit(1);

  if (!submission) {
    return null;
  }

  const [issues, diffLines] = await Promise.all([
    db
      .select({
        description: roastIssues.description,
        severity: roastIssues.severity,
        title: roastIssues.title,
      })
      .from(roastIssues)
      .where(eq(roastIssues.submissionId, submission.id))
      .orderBy(asc(roastIssues.displayOrder)),
    db
      .select({
        content: roastDiffLines.content,
        kind: roastDiffLines.kind,
        newLineNumber: roastDiffLines.newLineNumber,
        oldLineNumber: roastDiffLines.oldLineNumber,
      })
      .from(roastDiffLines)
      .where(eq(roastDiffLines.submissionId, submission.id))
      .orderBy(asc(roastDiffLines.displayOrder)),
  ]);

  return {
    createdAt: submission.createdAt?.toISOString(),
    diffLines: diffLines.map((line) => ({
      content: line.content,
      kind: line.kind,
      newLineNumber: line.newLineNumber ?? undefined,
      oldLineNumber: line.oldLineNumber ?? undefined,
    })),
    headline: submission.headline,
    issues,
    language: submission.language ?? "unknown",
    lineCount: submission.lineCount,
    roastMode: submission.roastMode,
    score: submission.score,
    scoreLabel: (submission.scoreLabel ??
      "warning") as RoastAnalysisResult["scoreLabel"],
    shareTitle: submission.shareTitle,
    shareSlug: submission.shareSlug,
    submissionId: submission.id,
    sourceCode: submission.sourceCode,
    summary: submission.summary,
    verdict: submission.verdict,
  };
}

export { getRoastBySlug };
