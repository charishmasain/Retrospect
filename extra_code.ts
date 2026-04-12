// ==========================================
// File: src/lib/hindsight.ts (The Hindsight retain/recall code)
// ==========================================

// Hindsight memory wrapper
// Uses @vectorize-io/hindsight for retain and recall

interface RetainParams {
  content: string;
  metadata: Record<string, string | number>;
}

interface RecallParams {
  query: string;
  topK: number;
  filter?: Record<string, string | number>;
}

interface MemoryResult {
  content: string;
  metadata: Record<string, string | number>;
  score?: number;
}

// Lazy-init the Hindsight client to handle missing API key gracefully
let hindsightClient: any = null;

async function getHindsight() {
  if (hindsightClient) return hindsightClient;

  const apiKey = process.env.HINDSIGHT_API_KEY;
  if (!apiKey) {
    console.warn("HINDSIGHT_API_KEY not set — using mock memory store");
    return null;
  }

  try {
    const { Hindsight } = await import("@vectorize-io/hindsight");
    hindsightClient = new Hindsight({ apiKey });
    return hindsightClient;
  } catch (e) {
    console.warn("Hindsight SDK not available — using mock memory store", e);
    return null;
  }
}

// In-memory fallback when Hindsight is not configured
const memoryStore: MemoryResult[] = [];

export async function retainMemory(params: RetainParams): Promise<void> {
  const client = await getHindsight();
  if (client) {
    await client.retain({
      content: params.content,
      metadata: params.metadata,
    });
  } else {
    memoryStore.push({
      content: params.content,
      metadata: params.metadata,
    });
  }
}

export async function recallMemories(
  params: RecallParams
): Promise<MemoryResult[]> {
  const client = await getHindsight();
  if (client) {
    const results = await client.recall({
      query: params.query,
      topK: params.topK,
      filter: params.filter,
    });
    return results.map((r: any) => ({
      content: r.content,
      metadata: r.metadata || {},
      score: r.score,
    }));
  }

  // Fallback: simple keyword matching
  const query = params.query.toLowerCase();
  const filtered = memoryStore
    .filter((m) => {
      if (
        params.filter?.userId &&
        m.metadata.userId !== params.filter.userId
      ) {
        return false;
      }
      return true;
    })
    .map((m) => {
      const words = query.split(/\s+/);
      const content = m.content.toLowerCase();
      const matchCount = words.filter((w) => content.includes(w)).length;
      return { ...m, score: matchCount / words.length };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, params.topK);

  return filtered;
}


// ==========================================
// File: src/app/api/decisions/log/route.ts (Decision logging)
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { retainMemory } from "@/lib/hindsight";

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

    const { decision, category, outcome, result, date } = await req.json();

    if (!decision || !category || !outcome || !result || !date) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const dbResult = db
      .prepare(
        "INSERT INTO decisions (user_id, decision, category, outcome, result, date) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(payload.userId, decision, category, outcome, result, date);

    // Retain in Hindsight memory
    try {
      await retainMemory({
        content: `Decision: ${decision}. Category: ${category}. Outcome: ${outcome}. Result: ${result}. Date: ${date}`,
        metadata: {
          userId: payload.userId,
          category,
          outcome,
          date,
        },
      });
    } catch (e) {
      console.warn("Hindsight retain failed:", e);
    }

    return NextResponse.json({
      id: dbResult.lastInsertRowid,
      message: "Decision logged and memory retained",
    });
  } catch (error: any) {
    console.error("Log decision error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


// ==========================================
// File: src/app/api/decisions/ask/route.ts (The agent query)
// ==========================================

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


// ==========================================
// File: src/app/api/decisions/list/route.ts (Optional)
// ==========================================

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
    const decisions = db
      .prepare(
        "SELECT * FROM decisions WHERE user_id = ? ORDER BY date DESC"
      )
      .all(payload.userId);

    return NextResponse.json({ decisions });
  } catch (error: any) {
    console.error("List decisions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
