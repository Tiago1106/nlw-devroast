"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { HomeRoastResult } from "@/components/home/home-roast-result";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";
import { submitRoast } from "@/features/roast/submit-roast";
import type { RoastAnalysisResult } from "@/features/roast/types";

import { HomeCodeEditor } from "./home-code-editor";
import type { SupportedLanguage } from "./language-options";

type HomeActionsProps = {
  averageScore: number;
  initialCode: string;
  totalRoasts: number;
};

function HomeActions({
  averageScore,
  initialCode,
  totalRoasts,
}: HomeActionsProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullRoast, setIsFullRoast] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RoastAnalysisResult | null>(null);
  const [resolvedLanguage, setResolvedLanguage] =
    useState<SupportedLanguage>("typescript");

  function handleRoast() {
    startTransition(async () => {
      try {
        const nextResult = await submitRoast({
          code,
          language: resolvedLanguage,
          roastMode: isFullRoast ? "full_roast" : "standard",
        });

        if (nextResult.shareSlug) {
          router.push(`/r/${nextResult.shareSlug}`);
          return;
        }

        setResult(nextResult);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to roast this code.",
        );
      }
    });
  }

  return (
    <>
      <HomeCodeEditor
        onChange={setCode}
        onResolvedLanguageChange={setResolvedLanguage}
        value={code}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Toggle
            checked={isFullRoast}
            label="roast mode"
            onCheckedChange={setIsFullRoast}
          />
          <Typography variant="meta">
            {isFullRoast
              ? "// maximum sarcasm enabled"
              : "// standard mode keeps the feedback less feral"}
          </Typography>
        </div>

        <Button disabled={!code.trim() || isPending} onClick={handleRoast}>
          {isPending ? "$ roasting..." : "$ roast_my_code"}
        </Button>
      </div>

      {errorMessage ? (
        <div className="border border-accent-red/40 bg-diff-removed px-4 py-3">
          <Typography className="font-mono text-xs text-accent-red">
            {errorMessage}
          </Typography>
        </div>
      ) : null}

      {result ? <HomeRoastResult result={result} /> : null}

      <div className="flex items-center justify-center gap-6 text-center">
        <Typography variant="meta">{`${totalRoasts.toLocaleString("en-US")} codes roasted`}</Typography>
        <Typography variant="meta">{`avg score: ${averageScore.toFixed(1)}/10`}</Typography>
      </div>
    </>
  );
}

export { HomeActions, type HomeActionsProps };
