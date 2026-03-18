import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { trips, schedules, expenses, journalEntries, savedFoodSpots, checklists, photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db.select().from(trips).where(eq(trips.id, tripId));

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.destinations !== undefined) updateData.destinations = JSON.stringify(body.destinations);
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.outboundFlight !== undefined) updateData.outboundFlight = JSON.stringify(body.outboundFlight);
    if (body.returnFlight !== undefined) updateData.returnFlight = JSON.stringify(body.returnFlight);
    if (body.hotel !== undefined) updateData.hotel = JSON.stringify(body.hotel);
    if (body.budget !== undefined) updateData.budget = JSON.stringify(body.budget);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db.update(trips).set(updateData).where(eq(trips.id, tripId));

    const updated = await db.select().from(trips).where(eq(trips.id, tripId));
    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update trip" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;

    // Delete all related data first (cascading)
    await db.delete(schedules).where(eq(schedules.tripId, tripId));
    await db.delete(expenses).where(eq(expenses.tripId, tripId));
    await db.delete(journalEntries).where(eq(journalEntries.tripId, tripId));
    await db.delete(savedFoodSpots).where(eq(savedFoodSpots.tripId, tripId));
    await db.delete(checklists).where(eq(checklists.tripId, tripId));
    await db.delete(photos).where(eq(photos.tripId, tripId));
    await db.delete(trips).where(eq(trips.id, tripId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
