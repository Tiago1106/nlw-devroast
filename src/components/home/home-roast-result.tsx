import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { SectionTitle, Typography } from "@/components/ui/typography";
import type { RoastAnalysisResult } from "@/features/roast/types";
import { cn } from "@/lib/cn";

import { ShareRoastButton } from "./share-roast-button";

type HomeRoastResultProps = {
  className?: string;
  result: RoastAnalysisResult;
};

function getVerdictLabel(verdict: RoastAnalysisResult["verdict"]) {
  return verdict.replaceAll("_", " ");
}

function HomeRoastResult({ className, result }: HomeRoastResultProps) {
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <div className="grid gap-6 border border-border-primary bg-bg-surface p-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="flex items-center justify-center">
          <ScoreRing size="md" value={result.score} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant={result.scoreLabel}>{result.scoreLabel}</Badge>
            <Badge showDot={false} variant="verdict">
              {getVerdictLabel(result.verdict)}
            </Badge>
            <Typography variant="meta">{`lang: ${result.language}`}</Typography>
            <Typography variant="meta">{`lines: ${result.lineCount}`}</Typography>
            <Typography variant="meta">{`mode: ${result.roastMode}`}</Typography>
          </div>

          <div className="flex flex-col gap-2">
            <SectionTitle>live_roast</SectionTitle>
            <Typography className="font-mono text-lg leading-7 text-text-primary">
              {result.headline}
            </Typography>
            <Typography>{result.summary}</Typography>

            {result.shareSlug ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  className={button({ size: "md", variant: "secondary" })}
                  href={`/r/${result.shareSlug}`}
                >
                  {"$ open_saved_roast"}
                </Link>
                <ShareRoastButton slug={result.shareSlug} />
                <Typography variant="meta">{`share: /r/${result.shareSlug}`}</Typography>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.issues.map((issue) => (
          <Card
            description={issue.description}
            key={`${issue.severity}-${issue.title}`}
            title={issue.title}
            variant={issue.severity}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 border border-border-primary bg-bg-surface p-5">
        <SectionTitle>suggested_diff</SectionTitle>
        <div className="overflow-hidden border border-border-primary bg-bg-page">
          {result.diffLines.map((line, index) => (
            <DiffLine
              key={`${line.kind}-${index}-${line.content}`}
              variant={line.kind}
            >
              {line.content}
            </DiffLine>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HomeRoastResult, type HomeRoastResultProps };
