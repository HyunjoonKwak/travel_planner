import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { savedFoodSpots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ tripId: string; spotId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { spotId } = await params;
    await db.delete(savedFoodSpots).where(eq(savedFoodSpots.id, spotId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete food spot" },
      { status: 500 }
    );
  }
}
