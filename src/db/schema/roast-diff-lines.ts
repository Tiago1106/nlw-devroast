import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { diffLineKindEnum } from "./enums";
import { roastSubmissions } from "./roast-submissions";

export const roastDiffLines = pgTable(
  "roast_diff_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => roastSubmissions.id, { onDelete: "cascade" }),
    kind: diffLineKindEnum("kind").notNull(),
    content: text("content").notNull(),
    displayOrder: integer("display_order").notNull(),
    oldLineNumber: integer("old_line_number"),
    newLineNumber: integer("new_line_number"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("roast_diff_lines_submission_order_idx").on(
      table.submissionId,
      table.displayOrder,
    ),
  ],
);
