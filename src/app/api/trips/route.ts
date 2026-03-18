import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { trips } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";
import { initializeDatabase } from "@/lib/db/migrate";

let dbInitialized = false;

function ensureDb(): void {
  if (!dbInitialized) {
    initializeDatabase();
    dbInitialized = true;
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    ensureDb();
    const all = await db.select().from(trips).orderBy(desc(trips.createdAt));
    return NextResponse.json({ success: true, data: all });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    ensureDb();
    const body = await req.json();
    const now = new Date().toISOString();
    const id = generateId();

    const newTrip = {
      id,
      name: body.name as string,
      country: (body.country as string) ?? null,
      destinations: body.destinations ? JSON.stringify(body.destinations) : null,
      theme: (body.theme as string) ?? null,
      startDate: (body.startDate as string) ?? null,
      endDate: (body.endDate as string) ?? null,
      outboundFlight: body.outboundFlight
        ? JSON.stringify(body.outboundFlight)
        : null,
      returnFlight: body.returnFlight ? JSON.stringify(body.returnFlight) : null,
      hotel: body.hotel ? JSON.stringify(body.hotel) : null,
      budget: body.budget ? JSON.stringify(body.budget) : null,
      isActive: (body.isActive as number) ?? 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(trips).values(newTrip);
    return NextResponse.json({ success: true, data: newTrip }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
