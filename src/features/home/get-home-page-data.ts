import { and, asc, desc, eq, sql } from "drizzle-orm";

import {
  getDb,
  isDatabaseConfigured,
  roastShares,
  roastSubmissions,
} from "@/db";

type HomeLeaderboardRow = {
  language: string;
  preview: string;
  rank: string;
  score: string;
  scoreTone: "critical" | "warning" | "good";
};

type HomePageStats = {
  averageScore: number;
  totalRoasts: number;
};

type HomePageData = {
  leaderboardRows: HomeLeaderboardRow[];
  stats: HomePageStats;
};

const FALLBACK_HOME_PAGE_DATA: HomePageData = {
  leaderboardRows: [
    {
      language: "javascript",
      preview: "var x = getItems().map() // what is happening?",
      rank: "#1",
      score: "1.2",
      scoreTone: "critical",
    },
    {
      language: "typescript",
      preview: "if (x == 'test') return true; else return false;",
      rank: "#2",
      score: "1.9",
      scoreTone: "critical",
    },
    {
      language: "sql",
      preview: "SELECT * FROM users WHERE id = user_id and something",
      rank: "#3",
      score: "2.1",
      scoreTone: "critical",
    },
  ],
  stats: {
    averageScore: 4.2,
    totalRoasts: 2847,
  },
};

function formatPreview(sourceCode: string) {
  return sourceCode.replace(/\s+/g, " ").trim().slice(0, 72);
}

function getScoreTone(score: number): HomeLeaderboardRow["scoreTone"] {
  if (score < 4) {
    return "critical";
  }

  if (score < 7) {
    return "warning";
  }

  return "good";
}

async function getHomePageData(): Promise<HomePageData> {
  if (!isDatabaseConfigured()) {
    return FALLBACK_HOME_PAGE_DATA;
  }

  try {
    const db = getDb();
    const leaderboard = await db
      .select({
        id: roastSubmissions.id,
        language: roastSubmissions.language,
        score: roastSubmissions.score,
        sourceCode: roastSubmissions.sourceCode,
        createdAt: roastSubmissions.createdAt,
        slug: roastShares.slug,
      })
      .from(roastSubmissions)
      .leftJoin(roastShares, eq(roastShares.submissionId, roastSubmissions.id))
      .where(
        and(
          eq(roastSubmissions.status, "completed"),
          eq(roastSubmissions.visibility, "public"),
        ),
      )
      .orderBy(asc(roastSubmissions.score), desc(roastSubmissions.createdAt))
      .limit(3);

    const [stats] = await db
      .select({
        averageScore:
          sql<number>`coalesce(round(avg(${roastSubmissions.score}), 1), 0)`.as(
            "average_score",
          ),
        totalRoasts:
          sql<number>`coalesce(count(${roastSubmissions.id}), 0)::int`.as(
            "total_roasts",
          ),
      })
      .from(roastSubmissions)
      .where(eq(roastSubmissions.status, "completed"));

    if (!stats) {
      return FALLBACK_HOME_PAGE_DATA;
    }

    return {
      leaderboardRows: leaderboard.map((row, index) => ({
        language: row.language ?? "unknown",
        preview: formatPreview(row.sourceCode),
        rank: `#${index + 1}`,
        score: row.score.toFixed(1),
        scoreTone: getScoreTone(row.score),
      })),
      stats: {
        averageScore: Number(stats.averageScore),
        totalRoasts: Number(stats.totalRoasts),
      },
    };
  } catch {
    return FALLBACK_HOME_PAGE_DATA;
  }
}

export {
  getHomePageData,
  type HomeLeaderboardRow,
  type HomePageData,
  type HomePageStats,
};
