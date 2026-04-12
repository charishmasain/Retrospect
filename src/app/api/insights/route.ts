import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = getDb();

    // Get all decisions
    const decisions = db
      .prepare("SELECT * FROM decisions WHERE user_id = ? ORDER BY date DESC")
      .all(payload.userId) as any[];

    const totalDecisions = decisions.length;

    // Positive outcomes
    const positiveOutcomes = decisions.filter(
      (d) => d.outcome === "Positive"
    ).length;

    // Patterns found (recall events)
    const recallEvents = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM recall_events WHERE user_id = ?"
      )
      .get(payload.userId) as { cnt: number };
    const patternsFound = recallEvents.cnt;

    // Memory confidence scale
    let memoryConfidence = 0;
    if (totalDecisions >= 30) memoryConfidence = 95;
    else if (totalDecisions >= 20) memoryConfidence = 80;
    else if (totalDecisions >= 10) memoryConfidence = 55;
    else if (totalDecisions >= 5) memoryConfidence = 30;
    else if (totalDecisions > 0) memoryConfidence = Math.round((totalDecisions / 5) * 30);

    // Category stats
    const categoryStats: Record<
      string,
      { total: number; positive: number; negative: number }
    > = {};
    for (const d of decisions) {
      if (!categoryStats[d.category]) {
        categoryStats[d.category] = { total: 0, positive: 0, negative: 0 };
      }
      categoryStats[d.category].total++;
      if (d.outcome === "Positive") categoryStats[d.category].positive++;
      if (d.outcome === "Negative") categoryStats[d.category].negative++;
    }

    // Find top category
    let topCategory = "";
    let topCategorySuccessRate = 0;
    let bestCategory = "";
    let bestCategoryRate = 0;
    let worstCategory = "";
    let worstNegativeCount = 0;

    for (const [cat, stats] of Object.entries(categoryStats)) {
      if (stats.total > (categoryStats[topCategory]?.total || 0)) {
        topCategory = cat;
        topCategorySuccessRate = Math.round(
          (stats.positive / stats.total) * 100
        );
      }
      const rate =
        stats.total > 0 ? stats.positive / stats.total : 0;
      if (rate > bestCategoryRate) {
        bestCategoryRate = rate;
        bestCategory = cat;
      }
      if (stats.negative > worstNegativeCount) {
        worstNegativeCount = stats.negative;
        worstCategory = cat;
      }
    }

    // Generate pattern insights
    const patterns = [];
    if (topCategory) {
      patterns.push(
        `Your ${topCategory} decisions succeed ${topCategorySuccessRate}% of the time`
      );
    }
    if (bestCategory) {
      patterns.push(
        `Your best performing category is ${bestCategory}`
      );
    }
    if (worstCategory && worstNegativeCount > 1) {
      patterns.push(
        `Your most common mistake involves ${worstCategory}`
      );
    }
    if (patterns.length === 0) {
      patterns.push("Log more decisions to discover patterns");
    }

    return NextResponse.json({
      totalDecisions,
      positiveOutcomes,
      patternsFound,
      memoryConfidence,
      categoryStats,
      patterns,
      decisions,
      topCategory,
      bestCategory,
      worstCategory,
    });
  } catch (error: any) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
