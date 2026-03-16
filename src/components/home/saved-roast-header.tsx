import Link from "next/link";

import { button } from "@/components/ui/button";
import { SectionTitle, Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

type SavedRoastHeaderProps = {
  className?: string;
};

function SavedRoastHeader({ className }: SavedRoastHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <SectionTitle>saved_roast</SectionTitle>
        <Typography>
          {"// persisted result with shareable slug and full roast breakdown"}
        </Typography>
      </div>

      <Link className={button({ size: "md", variant: "ghost" })} href="/">
        {"$ back_home"}
      </Link>
    </section>
  );
}

export { SavedRoastHeader, type SavedRoastHeaderProps };
