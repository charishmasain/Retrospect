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
