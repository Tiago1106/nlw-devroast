import "dotenv/config";

import { createHash } from "node:crypto";

import { faker } from "@faker-js/faker";

import { closeDbConnection, getDb } from "./client";
import {
  roastDiffLines,
  roastIssues,
  roastShares,
  roastSubmissions,
} from "./schema";

const SEED_COUNT = 100;

type ScoreLabel = "critical" | "warning" | "good";
type RoastVerdict = "needs_serious_help" | "needs_attention" | "actually_good";
type DiffKind = "removed" | "added" | "context";

type IssueTemplate = {
  description: string;
  title: string;
};

type VerdictTemplate = {
  label: ScoreLabel;
  scoreRange: readonly [number, number];
  summaryPrefix: string;
  verdict: RoastVerdict;
};

const LANGUAGE_PRESETS = {
  bash: {
    lines: [
      "#!/usr/bin/env bash",
      'for file in $(ls src); do echo "$file"; done',
      'rm -rf "$TEMP_DIR"',
    ],
  },
  css: {
    lines: [
      ".card {",
      "  color: #fff;",
      "  background: linear-gradient(90deg, #111, #333);",
      "}",
    ],
  },
  go: {
    lines: [
      "package main",
      "func main() {",
      '  println("hello from the roast queue")',
      "}",
    ],
  },
  html: {
    lines: [
      "<section>",
      '  <div class="card">',
      "    <button onclick=\"alert('hi')\">Launch</button>",
      "  </div>",
      "</section>",
    ],
  },
  java: {
    lines: [
      "public class Main {",
      "  public static void main(String[] args) {",
      '    System.out.println("hello chaos");',
      "  }",
      "}",
    ],
  },
  javascript: {
    lines: [
      "function calculateTotal(items) {",
      "  var total = 0;",
      "  for (var i = 0; i < items.length; i++) {",
      "    total = total + items[i].price;",
      "  }",
      "  return total;",
      "}",
    ],
  },
  json: {
    lines: ['{"debug": true, "features": ["roast", "share", "rank"]}'],
  },
  php: {
    lines: [
      "<?php",
      '$query = "SELECT * FROM users WHERE id = " . $_GET["id"];',
      "echo $query;",
    ],
  },
  python: {
    lines: [
      "def calculate_total(items):",
      "    total = 0",
      "    for item in items:",
      "        total += item['price']",
      "    return total",
    ],
  },
  rust: {
    lines: ["fn main() {", '    println!("shipping bugs to prod");', "}"],
  },
  sql: {
    lines: ["SELECT * FROM users WHERE id = user_id AND something = true;"],
  },
  typescript: {
    lines: [
      "type User = { id: string; score: number };",
      "function getScore(user: User) {",
      "  if (user.score == 10) return true; else return false;",
      "}",
    ],
  },
} as const;

const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_PRESETS) as Array<
  keyof typeof LANGUAGE_PRESETS
>;

const ISSUE_LIBRARY: Record<ScoreLabel, IssueTemplate[]> = {
  critical: [
    {
      description:
        "This snippet is one shortcut away from a security incident in production.",
      title: "unsafe runtime behavior",
    },
    {
      description:
        "The code couples risk, side effects and zero guardrails in the same place.",
      title: "dangerous side effects",
    },
    {
      description:
        "This is the kind of implementation that passes local tests and haunts the incident channel later.",
      title: "high blast radius",
    },
  ],
  good: [
    {
      description:
        "At least the intent is visible quickly, which is already better than half the internet.",
      title: "clear enough intent",
    },
    {
      description:
        "Even with rough edges, the snippet keeps a single responsibility in sight.",
      title: "focused responsibility",
    },
    {
      description:
        "The naming is serviceable and saves the reviewer from playing detective.",
      title: "decent naming",
    },
  ],
  warning: [
    {
      description:
        "It works, but only after making future you negotiate with avoidable complexity.",
      title: "unnecessary complexity",
    },
    {
      description:
        "This pattern keeps the code review longer than the feature deserves.",
      title: "verbose implementation",
    },
    {
      description:
        "The logic is correct-ish, but the shape invites bugs and accidental regressions.",
      title: "fragile control flow",
    },
  ],
};

const VERDICTS: VerdictTemplate[] = [
  {
    label: "critical",
    scoreRange: [1.1, 3.9],
    summaryPrefix:
      "This roast found enough red flags to justify immediate cleanup.",
    verdict: "needs_serious_help",
  },
  {
    label: "warning",
    scoreRange: [4.0, 6.8],
    summaryPrefix:
      "The code is salvageable, but it keeps choosing the scenic route.",
    verdict: "needs_attention",
  },
  {
    label: "good",
    scoreRange: [6.9, 9.6],
    summaryPrefix:
      "Shockingly enough, this one is mostly functional with only cosmetic bruises.",
    verdict: "actually_good",
  },
];

function getLineCount(sourceCode: string) {
  return sourceCode.split("\n").length;
}

function getSourceHash(sourceCode: string) {
  return createHash("sha256").update(sourceCode).digest("hex");
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createSourceCode(language: keyof typeof LANGUAGE_PRESETS) {
  const preset = LANGUAGE_PRESETS[language];
  const noiseLine = faker.helpers.arrayElement([
    "// TODO: fix this before demo",
    "// temporary patch from last deploy",
    "// why is this still here",
    "// do not ask who approved this",
  ]);

  return [...preset.lines, noiseLine].join("\n");
}

function pickVerdict() {
  const verdict = faker.helpers.weightedArrayElement([
    { value: VERDICTS[0], weight: 4 },
    { value: VERDICTS[1], weight: 4 },
    { value: VERDICTS[2], weight: 2 },
  ]);

  return {
    score: Number(
      faker.number
        .float({
          fractionDigits: 1,
          max: verdict.scoreRange[1],
          min: verdict.scoreRange[0],
        })
        .toFixed(1),
    ),
    scoreLabel: verdict.label,
    summaryPrefix: verdict.summaryPrefix,
    verdict: verdict.verdict,
  };
}

function createIssues(submissionId: string, scoreLabel: ScoreLabel) {
  const severities =
    scoreLabel === "critical"
      ? (["critical", "warning", "good"] as const)
      : scoreLabel === "warning"
        ? (["warning", "warning", "good"] as const)
        : (["good", "warning", "good"] as const);

  return severities.map((severity, index) => {
    const template = faker.helpers.arrayElement(ISSUE_LIBRARY[severity]);

    return {
      createdAt: faker.date.recent({ days: 30 }),
      description: template.description,
      displayOrder: index + 1,
      severity,
      submissionId,
      title: template.title,
    };
  });
}

function createDiffLines(submissionId: string, sourceCode: string) {
  const lines = sourceCode.split("\n").slice(0, 5);

  return lines.flatMap<{
    content: string;
    createdAt: Date;
    displayOrder: number;
    kind: DiffKind;
    newLineNumber?: number;
    oldLineNumber?: number;
    submissionId: string;
  }>((line, index) => {
    if (index === 1) {
      return [
        {
          content: line,
          createdAt: faker.date.recent({ days: 30 }),
          displayOrder: index * 2 + 1,
          kind: "removed" as const,
          oldLineNumber: index + 1,
          submissionId,
        },
        {
          content: line.replace(/var|==|SELECT \*/i, "const"),
          createdAt: faker.date.recent({ days: 30 }),
          displayOrder: index * 2 + 2,
          kind: "added" as const,
          newLineNumber: index + 1,
          submissionId,
        },
      ];
    }

    return [
      {
        content: line,
        createdAt: faker.date.recent({ days: 30 }),
        displayOrder: index * 2 + 1,
        kind: "context" as const,
        newLineNumber: index + 1,
        oldLineNumber: index + 1,
        submissionId,
      },
    ];
  });
}

async function seed() {
  faker.seed(42);

  const db = getDb();

  await db.delete(roastShares);
  await db.delete(roastDiffLines);
  await db.delete(roastIssues);
  await db.delete(roastSubmissions);

  const submissions = Array.from({ length: SEED_COUNT }, () => {
    const language = faker.helpers.arrayElement(LANGUAGE_OPTIONS);
    const sourceCode = createSourceCode(language);
    const roastMode = faker.helpers.arrayElement([
      "standard" as const,
      "full_roast" as const,
    ]);
    const verdictData = pickVerdict();
    const createdAt = faker.date.recent({ days: 90 });
    const titleBase = faker.hacker.phrase().replace(/[.]/g, "");

    return {
      createdAt,
      headline: `"${titleBase.toLowerCase()}"`,
      language,
      lineCount: getLineCount(sourceCode),
      roastMode,
      score: verdictData.score,
      scoreLabel: verdictData.scoreLabel,
      sourceCode,
      sourceHash: getSourceHash(sourceCode),
      status: "completed" as const,
      summary: `${verdictData.summaryPrefix} ${faker.company.buzzPhrase()}.`,
      updatedAt: createdAt,
      verdict: verdictData.verdict,
      visibility: faker.helpers.weightedArrayElement([
        { value: "public" as const, weight: 8 },
        { value: "private" as const, weight: 2 },
      ]),
    };
  });

  const insertedSubmissions = await db
    .insert(roastSubmissions)
    .values(submissions)
    .returning({
      headline: roastSubmissions.headline,
      id: roastSubmissions.id,
      language: roastSubmissions.language,
      scoreLabel: roastSubmissions.scoreLabel,
      sourceCode: roastSubmissions.sourceCode,
      visibility: roastSubmissions.visibility,
    });

  const issueRows = insertedSubmissions.flatMap((submission) =>
    createIssues(
      submission.id,
      (submission.scoreLabel as ScoreLabel | null) ?? "warning",
    ),
  );
  const diffRows = insertedSubmissions.flatMap((submission) =>
    createDiffLines(submission.id, submission.sourceCode),
  );
  const shareRows = insertedSubmissions
    .filter((submission) => submission.visibility === "public")
    .slice(0, 40)
    .map((submission, index) => ({
      description: faker.company.catchPhrase(),
      sharedAt: faker.date.recent({ days: 30 }),
      slug: `${toSlug(submission.language ?? "unknown")}-${index + 1}-${faker.string.alphanumeric(6).toLowerCase()}`,
      submissionId: submission.id,
      title: `devroast - ${submission.headline.replaceAll('"', "")}`,
    }));

  await db.insert(roastIssues).values(issueRows);
  await db.insert(roastDiffLines).values(diffRows);
  await db.insert(roastShares).values(shareRows);

  console.log(`Seeded ${insertedSubmissions.length} roast submissions.`);
  console.log(`Seeded ${issueRows.length} roast issues.`);
  console.log(`Seeded ${diffRows.length} diff lines.`);
  console.log(`Seeded ${shareRows.length} roast shares.`);
}

seed()
  .then(async () => {
    await closeDbConnection();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await closeDbConnection();
    process.exit(1);
  });
