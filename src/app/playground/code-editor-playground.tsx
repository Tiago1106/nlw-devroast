"use client";

import { useState } from "react";

import { CodeEditor } from "@/components/ui/code-editor";

type CodeEditorPlaygroundProps = {
  initialCode: string;
};

function CodeEditorPlayground({ initialCode }: CodeEditorPlaygroundProps) {
  const [code, setCode] = useState(initialCode);

  return (
    <CodeEditor
      filename="editable.js"
      onChange={(event) => setCode(event.target.value)}
      value={code}
    />
  );
}

export { CodeEditorPlayground, type CodeEditorPlaygroundProps };
