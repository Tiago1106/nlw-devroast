CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."diff_line_kind" AS ENUM('context', 'removed', 'added');--> statement-breakpoint
CREATE TYPE "public"."roast_issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."roast_mode" AS ENUM('standard', 'full_roast');--> statement-breakpoint
CREATE TYPE "public"."roast_verdict" AS ENUM('needs_serious_help', 'needs_attention', 'actually_good');--> statement-breakpoint
CREATE TYPE "public"."submission_visibility" AS ENUM('private', 'public', 'hidden');--> statement-breakpoint
CREATE TABLE "roast_diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"kind" "diff_line_kind" NOT NULL,
	"content" text NOT NULL,
	"display_order" integer NOT NULL,
	"old_line_number" integer,
	"new_line_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"severity" "roast_issue_severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"shared_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_code" text NOT NULL,
	"source_hash" varchar(64) NOT NULL,
	"language" text,
	"line_count" integer NOT NULL,
	"roast_mode" "roast_mode" NOT NULL,
	"status" "analysis_status" DEFAULT 'completed' NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"score_label" text,
	"verdict" "roast_verdict" NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"visibility" "submission_visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roast_diff_lines" ADD CONSTRAINT "roast_diff_lines_submission_id_roast_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."roast_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_issues" ADD CONSTRAINT "roast_issues_submission_id_roast_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."roast_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_shares" ADD CONSTRAINT "roast_shares_submission_id_roast_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."roast_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roast_diff_lines_submission_order_idx" ON "roast_diff_lines" USING btree ("submission_id","display_order");--> statement-breakpoint
CREATE INDEX "roast_issues_submission_order_idx" ON "roast_issues" USING btree ("submission_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "roast_shares_submission_id_uidx" ON "roast_shares" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roast_shares_slug_uidx" ON "roast_shares" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "roast_submissions_created_at_idx" ON "roast_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "roast_submissions_leaderboard_idx" ON "roast_submissions" USING btree ("visibility","status","score","created_at");--> statement-breakpoint
CREATE INDEX "roast_submissions_source_hash_idx" ON "roast_submissions" USING btree ("source_hash");