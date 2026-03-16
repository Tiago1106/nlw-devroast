import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  analysisStatusEnum,
  roastModeEnum,
  roastVerdictEnum,
  submissionVisibilityEnum,
} from "./enums";

export const roastSubmissions = pgTable(
  "roast_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceCode: text("source_code").notNull(),
    sourceHash: varchar("source_hash", { length: 64 }).notNull(),
    language: text("language"),
    lineCount: integer("line_count").notNull(),
    roastMode: roastModeEnum("roast_mode").notNull(),
    status: analysisStatusEnum("status").notNull().default("completed"),
    score: numeric("score", {
      precision: 3,
      scale: 1,
      mode: "number",
    }).notNull(),
    scoreLabel: text("score_label"),
    verdict: roastVerdictEnum("verdict").notNull(),
    headline: text("headline").notNull(),
    summary: text("summary").notNull(),
    visibility: submissionVisibilityEnum("visibility")
      .notNull()
      .default("private"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("roast_submissions_created_at_idx").on(table.createdAt),
    index("roast_submissions_leaderboard_idx").on(
      table.visibility,
      table.status,
      table.score,
      table.createdAt,
    ),
    index("roast_submissions_source_hash_idx").on(table.sourceHash),
  ],
);
