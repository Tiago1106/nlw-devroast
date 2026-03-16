import Link from "next/link";

import { button } from "@/components/ui/button";
import { SectionTitle, Typography } from "@/components/ui/typography";
import { getLeaderboardPageData } from "@/features/roast/get-leaderboard-page-data";

type LeaderboardPageProps = {
  searchParams?: Promise<{
    language?: string;
    score?: "all" | "critical" | "warning" | "good";
  }>;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedLanguage = resolvedSearchParams?.language ?? "all";
  const selectedScore = resolvedSearchParams?.score ?? "all";
  const { rows, stats } = await getLeaderboardPageData({
    language: selectedLanguage,
    score: selectedScore,
  });

  return (
    <main className="px-6 pb-16 pt-20">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-8">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <SectionTitle>shame_leaderboard</SectionTitle>
            <Typography>
              {"// the worst public roasts, sorted by damage and recency"}
            </Typography>
          </div>

          <Link className={button({ size: "md", variant: "ghost" })} href="/">
            {"$ back_home"}
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="border border-border-primary bg-bg-surface p-5">
            <Typography variant="meta">public roasts</Typography>
            <Typography className="pt-2 font-mono text-2xl text-text-primary">
              {stats.publicRoasts.toLocaleString("en-US")}
            </Typography>
          </div>

          <div className="border border-border-primary bg-bg-surface p-5">
            <Typography variant="meta">all completed roasts</Typography>
            <Typography className="pt-2 font-mono text-2xl text-text-primary">
              {stats.totalRoasts.toLocaleString("en-US")}
            </Typography>
          </div>

          <div className="border border-border-primary bg-bg-surface p-5">
            <Typography variant="meta">average score</Typography>
            <Typography className="pt-2 font-mono text-2xl text-text-primary">
              {stats.averageScore.toFixed(1)}/10
            </Typography>
          </div>
        </section>

        <section className="flex flex-wrap items-end gap-4 border border-border-primary bg-bg-surface p-5">
          <label className="flex min-w-[180px] flex-col gap-2">
            <Typography variant="meta">language filter</Typography>
            <select
              className="border border-border-primary bg-bg-elevated px-3 py-2 font-mono text-xs text-text-primary outline-none"
              defaultValue={selectedLanguage}
              form="leaderboard-filters"
              name="language"
            >
              {stats.availableLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[180px] flex-col gap-2">
            <Typography variant="meta">score bucket</Typography>
            <select
              className="border border-border-primary bg-bg-elevated px-3 py-2 font-mono text-xs text-text-primary outline-none"
              defaultValue={selectedScore}
              form="leaderboard-filters"
              name="score"
            >
              <option value="all">all</option>
              <option value="critical">critical</option>
              <option value="warning">warning</option>
              <option value="good">good</option>
            </select>
          </label>

          <form
            action="/leaderboard"
            className="flex flex-wrap gap-3"
            id="leaderboard-filters"
          >
            <button
              className={button({ size: "md", variant: "secondary" })}
              type="submit"
            >
              {"$ apply_filters"}
            </button>
            <Link
              className={button({ size: "md", variant: "ghost" })}
              href="/leaderboard"
            >
              {"$ clear"}
            </Link>
          </form>
        </section>

        <section className="overflow-hidden border border-border-primary bg-bg-surface">
          <div className="grid grid-cols-[64px_76px_minmax(0,1fr)_84px_76px_120px] gap-4 border-b border-border-primary bg-bg-elevated px-5 py-3 font-mono text-xs text-text-tertiary">
            <span>#</span>
            <span>score</span>
            <span>snippet</span>
            <span>lang</span>
            <span>lines</span>
            <span>date</span>
          </div>

          {rows.length ? (
            rows.map((row) => (
              <div
                className="grid grid-cols-[64px_76px_minmax(0,1fr)_84px_76px_120px] items-center gap-4 border-b border-border-primary px-5 py-4 font-mono text-xs last:border-b-0"
                key={`${row.rank}-${row.preview}`}
              >
                <span className="text-text-tertiary">{row.rank}</span>
                <span
                  className={
                    row.scoreTone === "critical"
                      ? "text-accent-red"
                      : row.scoreTone === "warning"
                        ? "text-accent-amber"
                        : "text-accent-green"
                  }
                >
                  {row.score}
                </span>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-text-secondary">
                    {row.preview}
                  </span>
                  {row.shareSlug ? (
                    <Link
                      className={button({
                        className: "shrink-0",
                        size: "sm",
                        variant: "ghost",
                      })}
                      href={`/r/${row.shareSlug}`}
                    >
                      view
                    </Link>
                  ) : null}
                </div>
                <span className="text-text-tertiary">{row.language}</span>
                <span className="text-text-tertiary">{row.lines}</span>
                <span className="text-text-tertiary">{row.createdAtLabel}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-2 px-5 py-10 text-center">
              <Typography className="font-mono text-sm text-text-primary">
                no roasts match these filters.
              </Typography>
              <Typography>
                {
                  "// try clearing the filters or generate a fresh roast from the home page"
                }
              </Typography>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
