import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { Navbar } from "@/components/ui/navbar";
import { ScoreRing } from "@/components/ui/score-ring";
import { TableRow } from "@/components/ui/table-row";
import { SectionTitle, Typography } from "@/components/ui/typography";

import { CodeEditorPlayground } from "./code-editor-playground";
import { PlaygroundSection } from "./playground-section";
import { TogglePlayground } from "./toggle-playground";

export const metadata: Metadata = {
  title: "UI Playground",
};

const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "danger"] as const;
const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const BUTTON_LABELS = {
  danger: "delete_roast",
  ghost: "view_all",
  primary: "roast_my_code",
  secondary: "share_roast",
} as const;
const BADGE_VARIANTS = ["critical", "warning", "good", "verdict"] as const;
const BADGE_LABELS = {
  critical: "critical",
  good: "good",
  verdict: "needs_serious_help",
  warning: "warning",
} as const;

function ButtonMatrixRow({ size }: { size: (typeof BUTTON_SIZES)[number] }) {
  return (
    <>
      <span className="flex items-center font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
        {size}
      </span>
      {BUTTON_VARIANTS.map((variant) => (
        <Button key={`${size}-${variant}`} size={size} variant={variant}>
          {BUTTON_LABELS[variant]}
        </Button>
      ))}
    </>
  );
}

export default function PlaygroundPage() {
  const codeSample = [
    "function calculateTotal(items) {",
    "  var total = 0;",
    "  for (var i = 0; i < items.length; i++) {",
    "    total = total + items[i].price;",
    "  }",
    "}",
  ].join("\n");

  return (
    <main className="min-h-screen bg-bg-page px-6 py-12 text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-accent-green">
            Internal playground
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="font-mono text-3xl font-medium text-text-primary">
              UI playground
            </h1>
            <p className="max-w-2xl text-sm text-text-secondary">
              Internal sandbox for validating shared UI components before using
              them in product screens.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          <PlaygroundSection
            defaultOpen
            description="Shared top navigation used across the app layout."
            title="Navbar"
          >
            <div className="grid gap-6">
              <Navbar />
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Typography primitives and recurring text treatments extracted from the component library."
            title="Typography"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="flex flex-col gap-5 border border-border-primary bg-bg-page p-6">
                <Typography variant="display">
                  paste your code. get roasted.
                </Typography>
                <SectionTitle>detailed_analysis</SectionTitle>
                <Typography>description text sample</Typography>
                <Typography variant="meta">
                  lang: javascript · 7 lines
                </Typography>
                <Typography variant="code">
                  function calculateTotal()
                </Typography>
              </article>
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Variants, sizes, states, and combined validation for the button."
            title="Button"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-medium text-text-primary">
                    Variants
                  </h3>
                  <p className="text-sm text-text-secondary">
                    The four variants supported by the shared button component.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  {BUTTON_VARIANTS.map((variant) => (
                    <Button key={variant} variant={variant}>
                      {BUTTON_LABELS[variant]}
                    </Button>
                  ))}
                </div>
              </article>

              <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-medium text-text-primary">
                    Sizes
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Button size scale using the primary visual treatment.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {BUTTON_SIZES.map((size) => (
                    <Button key={size} size={size} variant="primary">
                      {size}
                    </Button>
                  ))}
                </div>
              </article>

              <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-medium text-text-primary">
                    States
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Common interaction states and layout usage.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4">
                    <Button>Default</Button>
                    <Button disabled variant="secondary">
                      Disabled
                    </Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                  <div className="w-full max-w-md">
                    <Button className="w-full">Full width action</Button>
                  </div>
                </div>
              </article>

              <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-medium text-text-primary">
                    Variant x size matrix
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Combined validation for every supported variant and size.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <div className="grid min-w-[36rem] grid-cols-[5rem_repeat(4,minmax(0,1fr))] gap-3">
                    <span />
                    {BUTTON_VARIANTS.map((variant) => (
                      <span
                        key={variant}
                        className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary"
                      >
                        {variant}
                      </span>
                    ))}

                    {BUTTON_SIZES.map((size) => (
                      <ButtonMatrixRow key={size} size={size} />
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Controlled switch component based on the Pencil `toggleRow` states."
            title="Toggle"
          >
            <TogglePlayground />
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Status badges based on the Pencil `badgeSection` variants."
            title="Badge"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-medium text-text-primary">
                    Variants
                  </h3>
                  <p className="text-sm text-text-secondary">
                    The four badge variants extracted from the selected section.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {BADGE_VARIANTS.map((variant) => (
                    <Badge key={variant} variant={variant}>
                      {BADGE_LABELS[variant]}
                    </Badge>
                  ))}
                </div>
              </article>

              <article className="flex flex-col gap-4 border border-border-primary bg-bg-page p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-mono text-sm font-medium text-text-primary">
                    Dot visibility
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Optional dot rendering while preserving the label color.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <Badge variant="critical">critical</Badge>
                  <Badge showDot={false} variant="warning">
                    warning
                  </Badge>
                  <Badge variant="good">good</Badge>
                  <Badge showDot={false} variant="verdict">
                    needs_serious_help
                  </Badge>
                </div>
              </article>
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Reusable analysis cards with status context and supporting copy."
            title="Card"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card
                description="the var keyword is function-scoped rather than block-scoped, which can lead to unexpected behavior and bugs. modern javascript uses const for immutable bindings and let for mutable ones."
                title="using var instead of const/let"
                variant="critical"
              />
              <Card
                description="reusing a shared helper keeps the rendered output consistent across the app."
                statusLabel="good"
                title="component extraction done right"
                variant="good"
              />
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Server-rendered syntax highlighted code blocks using Shiki with the vesper theme."
            title="CodeBlock"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <CodeBlock code={codeSample} filename="calculate.js" lang="js" />
              <CodeEditorPlayground initialCode={codeSample} />
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Diff lines for removed, added, and unchanged code context."
            title="DiffLine"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <article className="flex flex-col gap-0 border border-border-primary bg-bg-page">
                <DiffLine variant="removed">var total = 0;</DiffLine>
                <DiffLine variant="added">const total = 0;</DiffLine>
                <DiffLine variant="context">
                  for (let i = 0; i &lt; items.length; i++) &#123;
                </DiffLine>
              </article>
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Reusable leaderboard-style rows for ranked code results."
            title="TableRow"
          >
            <div className="grid gap-6">
              <div className="border border-border-primary bg-bg-page">
                <TableRow
                  language="javascript"
                  preview="function calculateTotal(items) { var total = 0; ..."
                  rank="#1"
                  score="2.1"
                  scoreTone="critical"
                />
                <TableRow
                  language="typescript"
                  preview="const average = scores.reduce((sum, score) => sum + score, 0) / scores.length"
                  rank="#2"
                  score="7.4"
                  scoreTone="warning"
                />
                <TableRow
                  language="rust"
                  preview="items.iter().map(|item| item.price).sum::<u32>()"
                  rank="#3"
                  score="9.2"
                  scoreTone="good"
                />
              </div>
            </div>
          </PlaygroundSection>

          <PlaygroundSection
            defaultOpen
            description="Circular score visualization for compact summary displays."
            title="ScoreRing"
          >
            <div className="flex flex-wrap items-center gap-8 rounded-none border border-border-primary bg-bg-page p-6">
              <ScoreRing size="sm" value={2.1} />
              <ScoreRing size="md" value={5.8} />
              <ScoreRing size="lg" value={3.5} />
            </div>
          </PlaygroundSection>
        </div>
      </div>
    </main>
  );
}
