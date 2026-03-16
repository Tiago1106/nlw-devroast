import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

type RoastMetadataGridProps = {
  className?: string;
  createdAt?: string;
  language: string;
  submissionId?: string;
};

function formatCreatedAt(value?: string) {
  if (!value) {
    return "recent";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function RoastMetadataGrid({
  className,
  createdAt,
  language,
  submissionId,
}: RoastMetadataGridProps) {
  return (
    <section
      className={cn(
        "grid gap-4 border border-border-primary bg-bg-surface p-5 lg:grid-cols-3",
        className,
      )}
    >
      <div>
        <Typography variant="meta">submission id</Typography>
        <Typography className="pt-2 font-mono text-xs text-text-primary">
          {submissionId ?? "pending"}
        </Typography>
      </div>

      <div>
        <Typography variant="meta">language</Typography>
        <Typography className="pt-2 font-mono text-xs text-text-primary">
          {language}
        </Typography>
      </div>

      <div>
        <Typography variant="meta">created</Typography>
        <Typography className="pt-2 font-mono text-xs text-text-primary">
          {formatCreatedAt(createdAt)}
        </Typography>
      </div>
    </section>
  );
}

export { RoastMetadataGrid, type RoastMetadataGridProps };
