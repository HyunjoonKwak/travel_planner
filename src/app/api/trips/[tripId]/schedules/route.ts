import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { schedules } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(schedules)
      .where(eq(schedules.tripId, tripId))
      .orderBy(asc(schedules.date), asc(schedules.startTime));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const newSchedule = {
      id: generateId(),
      tripId,
      date: body.date as string,
      startTime: body.startTime as string,
      endTime: (body.endTime as string) ?? null,
      title: body.title as string,
      titleJa: (body.titleJa as string) ?? null,
      location: (body.location as string) ?? null,
      locationJa: (body.locationJa as string) ?? null,
      category: body.category as string,
      transport: (body.transport as string) ?? null,
      transportDuration: (body.transportDuration as string) ?? null,
      memo: (body.memo as string) ?? null,
      mapUrl: (body.mapUrl as string) ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schedules).values(newSchedule);
    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
