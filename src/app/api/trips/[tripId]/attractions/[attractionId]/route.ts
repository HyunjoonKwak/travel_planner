import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { savedAttractions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ tripId: string; attractionId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { attractionId } = await params;
    await db.delete(savedAttractions).where(eq(savedAttractions.id, attractionId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete attraction" },
      { status: 500 }
    );
  }
}
