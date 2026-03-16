"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ShareRoastButtonProps = {
  slug: string;
};

function ShareRoastButton({ slug }: ShareRoastButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const shareUrl = `${window.location.origin}/r/${slug}`;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <Button onClick={handleCopy} size="md" variant="ghost">
      {copied ? "$ copied_link" : "$ copy_link"}
    </Button>
  );
}

export { ShareRoastButton, type ShareRoastButtonProps };
