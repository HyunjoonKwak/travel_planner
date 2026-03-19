import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { memos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(memos)
      .where(eq(memos.tripId, tripId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: true, data: "" });
    }

    return NextResponse.json({ success: true, data: result[0].content });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch memo" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();
    const content = (body.data as string) ?? "";

    const existing = await db
      .select()
      .from(memos)
      .where(eq(memos.tripId, tripId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(memos)
        .set({ content, updatedAt: now })
        .where(eq(memos.id, existing[0].id));
    } else {
      await db.insert(memos).values({
        id: generateId(),
        tripId,
        content,
        updatedAt: now,
      });
    }

    return NextResponse.json({ success: true, data: content });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save memo" },
      { status: 500 }
    );
  }
}
