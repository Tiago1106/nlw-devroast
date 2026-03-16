import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { roastIssueSeverityEnum } from "./enums";
import { roastSubmissions } from "./roast-submissions";

export const roastIssues = pgTable(
  "roast_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => roastSubmissions.id, { onDelete: "cascade" }),
    severity: roastIssueSeverityEnum("severity").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    displayOrder: integer("display_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("roast_issues_submission_order_idx").on(
      table.submissionId,
      table.displayOrder,
    ),
  ],
);
