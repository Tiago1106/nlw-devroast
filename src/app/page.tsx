import Link from "next/link";

import { HomeActions } from "@/components/home/home-actions";
import { button } from "@/components/ui/button";
import { TableRow } from "@/components/ui/table-row";
import { SectionTitle, Typography } from "@/components/ui/typography";
import { getHomePageData } from "@/features/home/get-home-page-data";

export default async function Home() {
  const { leaderboardRows, stats } = await getHomePageData();

  return (
    <main className="px-6 pb-16 pt-20">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8">
        <section className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-3">
            <span className="font-mono text-4xl font-bold text-accent-green">
              $
            </span>
            <h1 className="font-mono text-4xl font-bold text-text-primary">
              paste your code. get roasted.
            </h1>
          </div>
          <Typography>
            {
              "// drop your code below and we'll rate it - brutally honest or full roast mode"
            }
          </Typography>
        </section>

        <section className="flex flex-col gap-4">
          <HomeActions
            averageScore={stats.averageScore}
            initialCode=""
            totalRoasts={stats.totalRoasts}
          />
        </section>

        <div className="h-7" />

        <section className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <SectionTitle>shame_leaderboard</SectionTitle>
              <Typography>
                {"// the worst code on the internet, ranked by shame"}
              </Typography>
            </div>

            <Link
              className={button({ size: "sm", variant: "ghost" })}
              href="/leaderboard"
            >
              {"$ view_all >>"}
            </Link>
          </div>

          <div className="overflow-hidden border border-border-primary bg-bg-surface">
            {leaderboardRows.length ? (
              <>
                <div className="grid w-full grid-cols-[50px_70px_minmax(0,1fr)_100px] items-center gap-6 border-b border-border-primary bg-bg-surface px-5 py-3 font-mono text-xs text-text-tertiary">
                  <span>#</span>
                  <span>score</span>
                  <span>code</span>
                  <span>lang</span>
                </div>

                {leaderboardRows.map((row) => (
                  <TableRow
                    key={row.rank}
                    className="grid-cols-[50px_70px_minmax(0,1fr)_100px]"
                    language={row.language}
                    preview={row.preview}
                    rank={row.rank}
                    score={row.score}
                    scoreTone={row.scoreTone}
                  />
                ))}
              </>
            ) : (
              <div className="flex flex-col gap-2 px-5 py-10 text-center">
                <Typography className="font-mono text-sm text-text-primary">
                  no public roasts yet.
                </Typography>
                <Typography>
                  {
                    "// be the first to embarrass a snippet and populate the board"
                  }
                </Typography>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Typography variant="meta">
              {leaderboardRows.length
                ? `showing top ${leaderboardRows.length} of ${stats.totalRoasts.toLocaleString("en-US")} - view full leaderboard >>`
                : "generate a roast to kick off the public leaderboard"}
            </Typography>
          </div>
        </section>
      </div>
    </main>
  );
}
