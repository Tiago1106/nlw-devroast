"use server";

import { createHash, randomBytes } from "node:crypto";

import { refresh } from "next/cache";

import {
  getDb,
  isDatabaseConfigured,
  roastDiffLines,
  roastIssues,
  roastShares,
  roastSubmissions,
} from "@/db";

import { analyzeCode } from "./analyze-code";
import type { SubmitRoastInput } from "./types";

function getSourceHash(sourceCode: string) {
  return createHash("sha256").update(sourceCode).digest("hex");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createShareSlug(language: string, headline: string) {
  const base =
    slugify(`${language}-${headline.replaceAll('"', "")}`) || "roast";
  const suffix = randomBytes(3).toString("hex");

  return `${base}-${suffix}`;
}

async function submitRoast(input: SubmitRoastInput) {
  const sourceCode = input.code.trim();

  if (!sourceCode) {
    throw new Error("Paste some code before roasting it.");
  }

  const analysis = analyzeCode(sourceCode, input.language, input.roastMode);

  if (isDatabaseConfigured()) {
    const db = getDb();
    const shareSlug = createShareSlug(analysis.language, analysis.headline);
    const [submission] = await db
      .insert(roastSubmissions)
      .values({
        headline: analysis.headline,
        language: analysis.language,
        lineCount: analysis.lineCount,
        roastMode: analysis.roastMode,
        score: analysis.score,
        scoreLabel: analysis.scoreLabel,
        sourceCode: analysis.sourceCode,
        sourceHash: getSourceHash(analysis.sourceCode),
        status: "completed",
        summary: analysis.summary,
        verdict: analysis.verdict,
        visibility: "public",
      })
      .returning({ id: roastSubmissions.id });

    if (submission) {
      await db.insert(roastIssues).values(
        analysis.issues.map((issue, index) => ({
          description: issue.description,
          displayOrder: index + 1,
          severity: issue.severity,
          submissionId: submission.id,
          title: issue.title,
        })),
      );

      await db.insert(roastDiffLines).values(
        analysis.diffLines.map((line, index) => ({
          content: line.content,
          displayOrder: index + 1,
          kind: line.kind,
          newLineNumber: line.newLineNumber ?? null,
          oldLineNumber: line.oldLineNumber ?? null,
          submissionId: submission.id,
        })),
      );

      await db.insert(roastShares).values({
        description: analysis.summary,
        slug: shareSlug,
        submissionId: submission.id,
        title: `devroast - ${analysis.headline.replaceAll('"', "")}`,
      });

      analysis.shareSlug = shareSlug;
      analysis.submissionId = submission.id;
    }
  }

  refresh();

  return analysis;
}

export { submitRoast };
