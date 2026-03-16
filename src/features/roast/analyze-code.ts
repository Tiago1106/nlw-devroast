import type {
  RoastAnalysisResult,
  RoastDiffLine,
  RoastIssue,
  RoastIssueSeverity,
  RoastMode,
  RoastVerdict,
} from "./types";

type RuleMatch = {
  description: string;
  diffBuilder?: (lines: string[]) => RoastDiffLine[];
  severity: RoastIssueSeverity;
  test: (code: string, lines: string[]) => boolean;
  title: string;
};

function getLineCount(sourceCode: string) {
  return sourceCode.split("\n").length;
}

function findLineIndex(lines: string[], matcher: (line: string) => boolean) {
  return lines.findIndex((line) => matcher(line));
}

function buildSingleLineReplacement(
  lines: string[],
  matcher: (line: string) => boolean,
  replacement: (line: string) => string,
) {
  const lineIndex = findLineIndex(lines, matcher);

  if (lineIndex === -1) {
    return buildContextDiff(lines);
  }

  const originalLine = lines[lineIndex] ?? "";
  const updatedLine = replacement(originalLine);

  return [
    {
      content: originalLine,
      kind: "removed",
      oldLineNumber: lineIndex + 1,
    },
    {
      content: updatedLine,
      kind: "added",
      newLineNumber: lineIndex + 1,
    },
  ] satisfies RoastDiffLine[];
}

function buildContextDiff(lines: string[]) {
  return lines.slice(0, 6).map((line, index) => ({
    content: line,
    kind: "context" as const,
    newLineNumber: index + 1,
    oldLineNumber: index + 1,
  }));
}

const RULES: RuleMatch[] = [
  {
    description:
      "`eval`, `document.write` or raw `innerHTML` turn your roast into a security incident.",
    diffBuilder: (lines) =>
      buildSingleLineReplacement(
        lines,
        (line) => /eval\(|document\.write\(|innerHTML\s*=/.test(line),
        () => "// sanitize input and remove unsafe runtime execution first",
      ),
    severity: "critical",
    test: (code) => /eval\(|document\.write\(|innerHTML\s*=/.test(code),
    title: "unsafe dynamic execution",
  },
  {
    description:
      "`var` keeps inviting hoisting bugs to the function. Prefer `const` by default and `let` when reassignment is intentional.",
    diffBuilder: (lines) =>
      buildSingleLineReplacement(
        lines,
        (line) => /\bvar\b/.test(line),
        (line) => line.replace(/\bvar\b/, "const"),
      ),
    severity: "critical",
    test: (code) => /\bvar\b/.test(code),
    title: "legacy var usage",
  },
  {
    description:
      "Loose equality leaves room for coercion tricks. Use strict comparison to make intent explicit.",
    diffBuilder: (lines) =>
      buildSingleLineReplacement(
        lines,
        (line) => /(^|[^=])==([^=]|$)|(^|[^!])!=([^=]|$)/.test(line),
        (line) =>
          line
            .replace(/(^|[^=])==([^=]|$)/g, "$1===$2")
            .replace(/(^|[^!])!=([^=]|$)/g, "$1!==$2"),
      ),
    severity: "warning",
    test: (code) => /(^|[^=])==([^=]|$)|(^|[^!])!=([^=]|$)/m.test(code),
    title: "non-strict equality",
  },
  {
    description:
      "`SELECT *` is easy today and expensive tomorrow. Ask only for the columns you actually need.",
    diffBuilder: (lines) =>
      buildSingleLineReplacement(
        lines,
        (line) => /select\s+\*/i.test(line),
        (line) => line.replace(/select\s+\*/i, "SELECT id, name"),
      ),
    severity: "warning",
    test: (code) => /select\s+\*/i.test(code),
    title: "unbounded sql selection",
  },
  {
    description:
      "Debug logging survived the trip into the roast zone. Strip it before pretending this is production ready.",
    diffBuilder: (lines) =>
      buildSingleLineReplacement(
        lines,
        (line) => /console\.log\(/.test(line),
        () => "// remove debug logging before shipping",
      ),
    severity: "warning",
    test: (code) => /console\.log\(/.test(code),
    title: "leftover debug logging",
  },
  {
    description:
      "There is a solid base here: the snippet stays focused on one task and is still readable enough to salvage.",
    severity: "good",
    test: () => true,
    title: "salvageable structure",
  },
];

function getVerdict(score: number): RoastVerdict {
  if (score < 4) {
    return "needs_serious_help";
  }

  if (score < 7) {
    return "needs_attention";
  }

  return "actually_good";
}

function getScoreLabel(score: number): RoastIssueSeverity {
  if (score < 4) {
    return "critical";
  }

  if (score < 7) {
    return "warning";
  }

  return "good";
}

function getHeadline(primaryIssue: RoastIssue, roastMode: RoastMode) {
  if (roastMode === "full_roast") {
    return `"${primaryIssue.title} is carrying enough chaos to power the whole roast by itself."`;
  }

  return `"${primaryIssue.title} is the first thing to fix before this snippet hurts anyone else."`;
}

function getSummary(
  issues: RoastIssue[],
  roastMode: RoastMode,
  language: string,
) {
  const issueCount = issues.filter((issue) => issue.severity !== "good").length;
  const tone =
    roastMode === "full_roast"
      ? "The roast mode stayed mean because the snippet gave it plenty to work with."
      : "The standard pass kept the feedback focused on the biggest wins first.";

  return `${tone} ${language} analysis flagged ${issueCount} high-impact cleanup points worth tackling before you call this done.`;
}

function collectIssues(code: string, lines: string[]) {
  const matchedRules = RULES.filter((rule) => rule.test(code, lines));
  const issues = matchedRules.slice(0, 4).map<RoastIssue>((rule) => ({
    description: rule.description,
    severity: rule.severity,
    title: rule.title,
  }));

  return issues.length
    ? issues
    : ([
        {
          description:
            "Nothing catastrophic showed up on the first pass, which is rare enough to count as a win.",
          severity: "good" as const,
          title: "surprisingly stable snippet",
        },
      ] satisfies RoastIssue[]);
}

function getPrimaryDiff(lines: string[], code: string) {
  const rule = RULES.find(
    (candidate) => candidate.diffBuilder && candidate.test(code, lines),
  );

  if (!rule?.diffBuilder) {
    return buildContextDiff(lines);
  }

  return rule.diffBuilder(lines);
}

function calculateScore(issues: RoastIssue[], roastMode: RoastMode) {
  let score = 8.4;

  for (const issue of issues) {
    if (issue.severity === "critical") {
      score -= 2.2;
      continue;
    }

    if (issue.severity === "warning") {
      score -= 1.1;
      continue;
    }

    score += 0.25;
  }

  if (roastMode === "full_roast") {
    score -= 0.4;
  }

  return Number(Math.max(1, Math.min(9.8, score)).toFixed(1));
}

function analyzeCodeHeuristic(
  sourceCode: string,
  language: string,
  roastMode: RoastMode,
): RoastAnalysisResult {
  const trimmedSource = sourceCode.trim();
  const lines = trimmedSource.split("\n");
  const issues = collectIssues(trimmedSource, lines);
  const score = calculateScore(issues, roastMode);
  const primaryIssue = issues[0] ?? {
    description: "No issues found.",
    severity: "good" as const,
    title: "clean snippet",
  };

  return {
    diffLines: getPrimaryDiff(lines, trimmedSource),
    headline: getHeadline(primaryIssue, roastMode),
    issues,
    language,
    lineCount: getLineCount(trimmedSource),
    roastMode,
    score,
    scoreLabel: getScoreLabel(score),
    sourceCode: trimmedSource,
    summary: getSummary(issues, roastMode, language),
    verdict: getVerdict(score),
  };
}

export { analyzeCodeHeuristic };
