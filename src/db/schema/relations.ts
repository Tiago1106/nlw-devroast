import { relations } from "drizzle-orm";

import { roastDiffLines } from "./roast-diff-lines";
import { roastIssues } from "./roast-issues";
import { roastShares } from "./roast-shares";
import { roastSubmissions } from "./roast-submissions";

export const roastSubmissionsRelations = relations(
  roastSubmissions,
  ({ many, one }) => ({
    diffLines: many(roastDiffLines),
    issues: many(roastIssues),
    share: one(roastShares),
  }),
);

export const roastIssuesRelations = relations(roastIssues, ({ one }) => ({
  submission: one(roastSubmissions, {
    fields: [roastIssues.submissionId],
    references: [roastSubmissions.id],
  }),
}));

export const roastDiffLinesRelations = relations(roastDiffLines, ({ one }) => ({
  submission: one(roastSubmissions, {
    fields: [roastDiffLines.submissionId],
    references: [roastSubmissions.id],
  }),
}));

export const roastSharesRelations = relations(roastShares, ({ one }) => ({
  submission: one(roastSubmissions, {
    fields: [roastShares.submissionId],
    references: [roastSubmissions.id],
  }),
}));
