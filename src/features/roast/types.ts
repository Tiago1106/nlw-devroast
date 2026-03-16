type RoastMode = "standard" | "full_roast";

type RoastIssueSeverity = "critical" | "warning" | "good";

type RoastVerdict = "needs_serious_help" | "needs_attention" | "actually_good";

type RoastDiffLineKind = "context" | "removed" | "added";

type RoastIssue = {
  description: string;
  severity: RoastIssueSeverity;
  title: string;
};

type RoastDiffLine = {
  content: string;
  kind: RoastDiffLineKind;
  newLineNumber?: number;
  oldLineNumber?: number;
};

type RoastAnalysisResult = {
  diffLines: RoastDiffLine[];
  headline: string;
  issues: RoastIssue[];
  language: string;
  lineCount: number;
  roastMode: RoastMode;
  score: number;
  scoreLabel: RoastIssueSeverity;
  shareSlug?: string;
  submissionId?: string;
  sourceCode: string;
  summary: string;
  verdict: RoastVerdict;
};

type SubmitRoastInput = {
  code: string;
  language: string;
  roastMode: RoastMode;
};

export type {
  RoastAnalysisResult,
  RoastDiffLine,
  RoastDiffLineKind,
  RoastIssue,
  RoastIssueSeverity,
  RoastMode,
  RoastVerdict,
  SubmitRoastInput,
};
