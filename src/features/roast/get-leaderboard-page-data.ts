import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";

import {
  getDb,
  isDatabaseConfigured,
  roastShares,
  roastSubmissions,
} from "@/db";

type LeaderboardPageRow = {
  createdAtLabel: string;
  language: string;
  lines: number;
  preview: string;
  rank: string;
  score: string;
  scoreTone: "critical" | "warning" | "good";
  shareSlug: string | null;
};

type LeaderboardSort = "score_asc" | "score_desc" | "recent";

type LeaderboardPageStats = {
  averageScore: number;
  availableLanguages: string[];
  currentPage: number;
  filteredRoasts: number;
  pageSize: number;
  publicRoasts: number;
  totalRoasts: number;
  totalPages: number;
};

type LeaderboardPageData = {
  rows: LeaderboardPageRow[];
  stats: LeaderboardPageStats;
};

const FALLBACK_LEADERBOARD_PAGE_DATA: LeaderboardPageData = {
  rows: [
    {
      createdAtLabel: "just now",
      language: "javascript",
      lines: 4,
      preview: "var x = getItems().map() // what is happening?",
      rank: "#1",
      score: "1.2",
      scoreTone: "critical",
      shareSlug: null,
    },
    {
      createdAtLabel: "just now",
      language: "typescript",
      lines: 3,
      preview: "if (x == 'test') return true; else return false;",
      rank: "#2",
      score: "1.9",
      scoreTone: "critical",
      shareSlug: null,
    },
    {
      createdAtLabel: "just now",
      language: "sql",
      lines: 1,
      preview: "SELECT * FROM users WHERE id = user_id and something",
      rank: "#3",
      score: "2.1",
      scoreTone: "critical",
      shareSlug: null,
    },
  ],
  stats: {
    averageScore: 4.2,
    availableLanguages: ["all", "javascript", "typescript", "sql"],
    currentPage: 1,
    filteredRoasts: 3,
    pageSize: 12,
    publicRoasts: 1320,
    totalRoasts: 2847,
    totalPages: 1,
  },
};

type LeaderboardLanguageFilter = string;
type LeaderboardScoreFilter = "all" | "critical" | "warning" | "good";

type LeaderboardFilters = {
  language?: LeaderboardLanguageFilter;
  page?: number;
  score?: LeaderboardScoreFilter;
  sort?: LeaderboardSort;
};

const LEADERBOARD_PAGE_SIZE = 12;

function formatPreview(sourceCode: string) {
  return sourceCode.replace(/\s+/g, " ").trim().slice(0, 92);
}

function getScoreTone(score: number): LeaderboardPageRow["scoreTone"] {
  if (score < 4) {
    return "critical";
  }

  if (score < 7) {
    return "warning";
  }

  return "good";
}

function formatCreatedAt(date: Date | null) {
  if (!date) {
    return "recent";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

async function getLeaderboardPageData(
  filters: LeaderboardFilters = {},
): Promise<LeaderboardPageData> {
  if (!isDatabaseConfigured()) {
    return FALLBACK_LEADERBOARD_PAGE_DATA;
  }

  try {
    const db = getDb();
    const page = Math.max(filters.page ?? 1, 1);
    const offset = (page - 1) * LEADERBOARD_PAGE_SIZE;
    const scoreCondition =
      filters.score === "critical"
        ? lt(roastSubmissions.score, 4)
        : filters.score === "warning"
          ? and(gte(roastSubmissions.score, 4), lt(roastSubmissions.score, 7))
          : filters.score === "good"
            ? gte(roastSubmissions.score, 7)
            : undefined;
    const languageCondition =
      filters.language && filters.language !== "all"
        ? eq(roastSubmissions.language, filters.language)
        : undefined;
    const whereConditions = and(
      eq(roastSubmissions.status, "completed"),
      eq(roastSubmissions.visibility, "public"),
      languageCondition,
      scoreCondition,
    );

    const orderByClause =
      filters.sort === "score_desc"
        ? [desc(roastSubmissions.score), desc(roastSubmissions.createdAt)]
        : filters.sort === "recent"
          ? [desc(roastSubmissions.createdAt), asc(roastSubmissions.score)]
          : [asc(roastSubmissions.score), desc(roastSubmissions.createdAt)];

    const [rows, [stats], languages, [filteredCount]] = await Promise.all([
      db
        .select({
          createdAt: roastSubmissions.createdAt,
          language: roastSubmissions.language,
          lineCount: roastSubmissions.lineCount,
          score: roastSubmissions.score,
          shareSlug: roastShares.slug,
          sourceCode: roastSubmissions.sourceCode,
        })
        .from(roastSubmissions)
        .leftJoin(
          roastShares,
          eq(roastShares.submissionId, roastSubmissions.id),
        )
        .where(whereConditions)
        .orderBy(...orderByClause)
        .limit(LEADERBOARD_PAGE_SIZE)
        .offset(offset),
      db
        .select({
          averageScore:
            sql<number>`coalesce(round(avg(${roastSubmissions.score}), 1), 0)`.as(
              "average_score",
            ),
          publicRoasts:
            sql<number>`coalesce(count(case when ${roastSubmissions.visibility} = 'public' then 1 end), 0)::int`.as(
              "public_roasts",
            ),
          totalRoasts:
            sql<number>`coalesce(count(${roastSubmissions.id}), 0)::int`.as(
              "total_roasts",
            ),
        })
        .from(roastSubmissions)
        .where(eq(roastSubmissions.status, "completed")),
      db
        .select({ language: roastSubmissions.language })
        .from(roastSubmissions)
        .where(
          and(
            eq(roastSubmissions.status, "completed"),
            eq(roastSubmissions.visibility, "public"),
          ),
        )
        .groupBy(roastSubmissions.language)
        .orderBy(asc(roastSubmissions.language)),
      db
        .select({
          total:
            sql<number>`coalesce(count(${roastSubmissions.id}), 0)::int`.as(
              "total",
            ),
        })
        .from(roastSubmissions)
        .where(whereConditions),
    ]);

    if (!stats) {
      return FALLBACK_LEADERBOARD_PAGE_DATA;
    }

    return {
      rows: rows.map((row, index) => ({
        createdAtLabel: formatCreatedAt(row.createdAt),
        language: row.language ?? "unknown",
        lines: row.lineCount,
        preview: formatPreview(row.sourceCode),
        rank: `#${offset + index + 1}`,
        score: row.score.toFixed(1),
        scoreTone: getScoreTone(row.score),
        shareSlug: row.shareSlug,
      })),
      stats: {
        averageScore: Number(stats.averageScore),
        availableLanguages: [
          "all",
          ...languages
            .map((entry) => entry.language)
            .filter((language): language is string => Boolean(language)),
        ],
        currentPage: page,
        filteredRoasts: Number(filteredCount?.total ?? 0),
        pageSize: LEADERBOARD_PAGE_SIZE,
        publicRoasts: Number(stats.publicRoasts),
        totalRoasts: Number(stats.totalRoasts),
        totalPages: Math.max(
          1,
          Math.ceil(Number(filteredCount?.total ?? 0) / LEADERBOARD_PAGE_SIZE),
        ),
      },
    };
  } catch {
    return FALLBACK_LEADERBOARD_PAGE_DATA;
  }
}

export {
  getLeaderboardPageData,
  type LeaderboardFilters,
  type LeaderboardLanguageFilter,
  type LeaderboardPageData,
  type LeaderboardPageRow,
  type LeaderboardPageStats,
  type LeaderboardScoreFilter,
  type LeaderboardSort,
};
