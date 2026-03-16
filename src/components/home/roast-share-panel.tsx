"use client";

import Link from "next/link";

import { button } from "@/components/ui/button";
import { SectionTitle, Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

import { ShareRoastButton } from "./share-roast-button";

type RoastSharePanelProps = {
  className?: string;
  createdAt?: string;
  lineCount: number;
  score: number;
  shareSlug: string;
  shareTitle?: string;
};

function formatShareDate(value?: string) {
  if (!value) {
    return "just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function RoastSharePanel({
  className,
  createdAt,
  lineCount,
  score,
  shareSlug,
  shareTitle,
}: RoastSharePanelProps) {
  return (
    <section
      className={cn(
        "grid gap-4 border border-border-primary bg-bg-surface p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <SectionTitle>share_packet</SectionTitle>
        <Typography className="font-mono text-base text-text-primary">
          {shareTitle ?? "devroast saved result"}
        </Typography>
        <div className="flex flex-wrap items-center gap-4">
          <Typography variant="meta">{`share slug: ${shareSlug}`}</Typography>
          <Typography variant="meta">{`saved: ${formatShareDate(createdAt)}`}</Typography>
          <Typography variant="meta">{`lines: ${lineCount}`}</Typography>
          <Typography variant="meta">{`score: ${score.toFixed(1)}/10`}</Typography>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ShareRoastButton slug={shareSlug} />
        <Link
          className={button({ size: "md", variant: "secondary" })}
          href={`/r/${shareSlug}`}
        >
          {"$ refresh_view"}
        </Link>
      </div>
    </section>
  );
}

export { RoastSharePanel, type RoastSharePanelProps };
