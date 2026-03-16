import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["standard", "full_roast"]);

export const analysisStatusEnum = pgEnum("analysis_status", [
  "pending",
  "completed",
  "failed",
]);

export const submissionVisibilityEnum = pgEnum("submission_visibility", [
  "private",
  "public",
  "hidden",
]);

export const roastVerdictEnum = pgEnum("roast_verdict", [
  "needs_serious_help",
  "needs_attention",
  "actually_good",
]);

export const roastIssueSeverityEnum = pgEnum("roast_issue_severity", [
  "critical",
  "warning",
  "good",
]);

export const diffLineKindEnum = pgEnum("diff_line_kind", [
  "context",
  "removed",
  "added",
]);
