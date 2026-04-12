import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { recallMemories } from "@/lib/hindsight";
import { askGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
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

    const { question } = await req.json();
    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // 1. Recall memories from Hindsight
    let memories: any[] = [];
    try {
      memories = await recallMemories({
        query: question,
        topK: 5,
        filter: { userId: payload.userId },
      });
    } catch (e) {
      console.warn("Hindsight recall failed, using DB fallback:", e);
    }

    // Fallback: if Hindsight returned nothing, use DB decisions
    if (memories.length === 0) {
      const db = getDb();
      const decisions = db
        .prepare(
          "SELECT * FROM decisions WHERE user_id = ? ORDER BY date DESC LIMIT 5"
        )
        .all(payload.userId) as any[];

      memories = decisions.map((d) => ({
        content: `Decision: ${d.decision}. Category: ${d.category}. Outcome: ${d.outcome}. Result: ${d.result}. Date: ${d.date}`,
        metadata: {
          category: d.category,
          outcome: d.outcome,
          date: d.date,
          decisionId: d.id,
        },
      }));
    }

    // 2. Build context from recalled memories
    const context = memories
      .map(
        (m, i) => `Memory ${i + 1}: ${m.content}`
      )
      .join("\n\n");

    // 3. Log recall event
    const db = getDb();
    db.prepare(
      "INSERT INTO recall_events (user_id, query, recalled_count) VALUES (?, ?, ?)"
    ).run(payload.userId, question, memories.length);

    // 4. Ask Gemini
    const answer = await askGemini(question, context);

    // 5. Get matching decision IDs from DB for frontend highlighting
    const allDecisions = db
      .prepare("SELECT * FROM decisions WHERE user_id = ? ORDER BY date DESC")
      .all(payload.userId) as any[];

    const recalledIds: number[] = [];
    for (const memory of memories) {
      for (const d of allDecisions) {
        if (
          memory.content.includes(d.decision) ||
          (memory.metadata?.decisionId &&
            memory.metadata.decisionId === d.id)
        ) {
          if (!recalledIds.includes(d.id)) {
            recalledIds.push(d.id);
          }
        }
      }
    }

    // If we couldn't match by content, use the first N decisions as recalled
    if (recalledIds.length === 0 && allDecisions.length > 0) {
      const topDecisions = allDecisions.slice(0, Math.min(memories.length, 5));
      topDecisions.forEach((d: any) => recalledIds.push(d.id));
    }

    return NextResponse.json({
      answer,
      recalledIds,
      memoriesCount: memories.length,
      confidence: Math.min(
        95,
        Math.round((memories.length / 5) * 82)
      ),
    });
  } catch (error: any) {
    console.error("Ask decision error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
