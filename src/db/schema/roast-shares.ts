import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { roastSubmissions } from "./roast-submissions";

export const roastShares = pgTable(
  "roast_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => roastSubmissions.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    sharedAt: timestamp("shared_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("roast_shares_submission_id_uidx").on(table.submissionId),
    uniqueIndex("roast_shares_slug_uidx").on(table.slug),
  ],
);
