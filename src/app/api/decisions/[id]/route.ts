import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const decisionId = resolvedParams.id;

    if (!decisionId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const db = getDb();
    
    // Verify ownership
    const dec = db.prepare("SELECT user_id FROM decisions WHERE id = ?").get(decisionId) as any;
    if (!dec) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (dec.user_id !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    db.prepare("DELETE FROM decisions WHERE id = ? AND user_id = ?").run(decisionId, payload.userId);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Delete decision error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
