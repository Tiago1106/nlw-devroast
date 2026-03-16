import { notFound } from "next/navigation";

import { HomeRoastResult } from "@/components/home/home-roast-result";
import { RoastCodePreview } from "@/components/home/roast-code-preview";
import { RoastMetadataGrid } from "@/components/home/roast-metadata-grid";
import { RoastSharePanel } from "@/components/home/roast-share-panel";
import { SavedRoastHeader } from "@/components/home/saved-roast-header";
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
        <SavedRoastHeader />

        {result.shareSlug ? (
          <RoastSharePanel
            createdAt={result.createdAt}
            lineCount={result.lineCount}
            score={result.score}
            shareSlug={result.shareSlug}
            shareTitle={result.shareTitle}
          />
        ) : null}

        <HomeRoastResult hideSavedRoastActions result={result} />

        <RoastCodePreview code={result.sourceCode} language={result.language} />

        <RoastMetadataGrid
          createdAt={result.createdAt}
          language={result.language}
          submissionId={result.submissionId}
        />
      </div>
    </main>
  );
}
