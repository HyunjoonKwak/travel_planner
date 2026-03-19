import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { savedFoodSpots } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(savedFoodSpots)
      .where(eq(savedFoodSpots.tripId, tripId))
      .orderBy(asc(savedFoodSpots.createdAt));

    const spots = result.map((row) => {
      let extra: Record<string, unknown> = {};
      if (row.data) {
        try { extra = JSON.parse(row.data); } catch { /* ignore corrupt data */ }
      }
      // Spread extra first so named columns always take precedence
      return {
        ...extra,
        id: row.id,
        tripId: row.tripId,
        name: row.name,
        nameJa: row.nameJa,
        category: row.category,
        area: row.area,
        address: row.address,
        rating: row.rating,
        priceRange: row.priceRange,
        hours: row.hours,
        placeId: row.placeId,
        googleRating: row.googleRating,
        googleReviewCount: row.googleReviewCount,
      };
    });

    return NextResponse.json({ success: true, data: spots });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch food spots" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    // Store main fields in columns, extra in data JSON
    const { name, nameJa, category, area, address, rating, priceRange, hours, placeId, googleRating, googleReviewCount, ...extra } = body;

    const newSpot = {
      id: generateId(),
      tripId,
      name: name as string,
      nameJa: (nameJa as string) ?? null,
      category: (category as string) ?? null,
      area: (area as string) ?? null,
      address: (address as string) ?? null,
      rating: (rating as number) ?? null,
      priceRange: (priceRange as string) ?? null,
      hours: (hours as string) ?? null,
      placeId: (placeId as string) ?? null,
      googleRating: (googleRating as number) ?? null,
      googleReviewCount: (googleReviewCount as number) ?? null,
      data: JSON.stringify(extra),
      createdAt: now,
    };

    await db.insert(savedFoodSpots).values(newSpot);

    return NextResponse.json({
      success: true,
      data: { ...body, id: newSpot.id, tripId },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save food spot" },
      { status: 500 }
    );
  }
}
