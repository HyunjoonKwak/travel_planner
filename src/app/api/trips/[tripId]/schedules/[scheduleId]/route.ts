import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { schedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ tripId: string; scheduleId: string }> };

export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { scheduleId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (body.date !== undefined) updateData.date = body.date;
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.titleJa !== undefined) updateData.titleJa = body.titleJa;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.locationJa !== undefined) updateData.locationJa = body.locationJa;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.transport !== undefined) updateData.transport = body.transport;
    if (body.transportDuration !== undefined) updateData.transportDuration = body.transportDuration;
    if (body.memo !== undefined) updateData.memo = body.memo;
    if (body.mapUrl !== undefined) updateData.mapUrl = body.mapUrl;

    await db.update(schedules).set(updateData).where(eq(schedules.id, scheduleId));

    const updated = await db.select().from(schedules).where(eq(schedules.id, scheduleId));
    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { scheduleId } = await params;
    await db.delete(schedules).where(eq(schedules.id, scheduleId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
