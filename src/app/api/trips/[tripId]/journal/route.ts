import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { journalEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.tripId, tripId))
      .orderBy(desc(journalEntries.date));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const newEntry = {
      id: generateId(),
      tripId,
      date: body.date as string,
      content: body.content as string,
      location: (body.location as string) ?? null,
      mood: body.mood as string,
      weather: (body.weather as string) ?? null,
      temperature: (body.temperature as number) ?? null,
      photoIds: body.photoIds ? JSON.stringify(body.photoIds) : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(journalEntries).values(newEntry);
    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create journal entry" },
      { status: 500 }
    );
  }
}
