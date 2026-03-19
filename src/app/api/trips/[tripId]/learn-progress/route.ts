import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { learnProgress } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(learnProgress)
      .where(eq(learnProgress.tripId, tripId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const parsed = JSON.parse(result[0].data);
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch learn progress" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();
    const dataStr = JSON.stringify(body.data);

    const existing = await db
      .select()
      .from(learnProgress)
      .where(eq(learnProgress.tripId, tripId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(learnProgress)
        .set({ data: dataStr, updatedAt: now })
        .where(eq(learnProgress.id, existing[0].id));
    } else {
      await db.insert(learnProgress).values({
        id: generateId(),
        tripId,
        data: dataStr,
        updatedAt: now,
      });
    }

    return NextResponse.json({ success: true, data: body.data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save learn progress" },
      { status: 500 }
    );
  }
}
