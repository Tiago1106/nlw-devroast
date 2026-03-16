import { HomeActions } from "@/components/home/home-actions";
import { Button } from "@/components/ui/button";
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

            <Button size="sm" variant="ghost">
              $ view_all &gt;&gt;
            </Button>
          </div>

          <div className="overflow-hidden border border-border-primary bg-bg-surface">
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
          </div>

          <div className="flex justify-center">
            <Typography variant="meta">
              {`showing top ${leaderboardRows.length} of ${stats.totalRoasts.toLocaleString("en-US")} - view full leaderboard >>`}
            </Typography>
          </div>
        </section>
      </div>
    </main>
  );
}
