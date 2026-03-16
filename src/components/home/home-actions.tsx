"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";

type HomeActionsProps = {
  initialCode: string;
};

function HomeActions({ initialCode }: HomeActionsProps) {
  const [code, setCode] = useState(initialCode);

  return (
    <>
      <CodeEditor
        className="w-full"
        filename="calculate.js"
        onChange={(event) => setCode(event.target.value)}
        value={code}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Toggle checked label="roast mode" onCheckedChange={() => {}} />
          <Typography variant="meta">{"// maximum sarcasm enabled"}</Typography>
        </div>

        <Button>$ roast_my_code</Button>
      </div>

      <div className="flex items-center justify-center gap-6 text-center">
        <Typography variant="meta">2,847 codes roasted</Typography>
        <Typography variant="meta">avg score: 4.2/10</Typography>
      </div>
    </>
  );
}

export { HomeActions, type HomeActionsProps };
