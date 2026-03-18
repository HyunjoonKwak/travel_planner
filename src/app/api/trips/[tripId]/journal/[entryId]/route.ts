import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { journalEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ tripId: string; entryId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { entryId } = await params;
    const result = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, entryId));

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    const entry = result[0];
    const parsed = {
      ...entry,
      photoIds: entry.photoIds ? JSON.parse(entry.photoIds) : [],
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entry" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { entryId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (body.date !== undefined) updateData.date = body.date;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.mood !== undefined) updateData.mood = body.mood;
    if (body.weather !== undefined) updateData.weather = body.weather;
    if (body.temperature !== undefined) updateData.temperature = body.temperature;
    if (body.photoIds !== undefined) updateData.photoIds = JSON.stringify(body.photoIds);

    await db.update(journalEntries).set(updateData).where(eq(journalEntries.id, entryId));

    const updated = await db.select().from(journalEntries).where(eq(journalEntries.id, entryId));
    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update journal entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { entryId } = await params;
    await db.delete(journalEntries).where(eq(journalEntries.id, entryId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
