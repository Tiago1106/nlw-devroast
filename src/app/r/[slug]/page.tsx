import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeRoastResult } from "@/components/home/home-roast-result";
import { button } from "@/components/ui/button";
import { SectionTitle, Typography } from "@/components/ui/typography";
import { getRoastBySlug } from "@/features/roast/get-roast-by-slug";

type RoastSharePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RoastSharePage({ params }: RoastSharePageProps) {
  const { slug } = await params;
  const result = await getRoastBySlug(slug);

  if (!result) {
    notFound();
  }

  return (
    <main className="px-6 pb-16 pt-20">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <SectionTitle>saved_roast</SectionTitle>
            <Typography>
              {
                "// persisted result with shareable slug and full roast breakdown"
              }
            </Typography>
          </div>

          <Link className={button({ size: "md", variant: "ghost" })} href="/">
            {"$ back_home"}
          </Link>
        </section>

        <HomeRoastResult result={result} />
      </div>
    </main>
  );
}
