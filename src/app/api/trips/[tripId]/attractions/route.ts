import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { savedAttractions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(savedAttractions)
      .where(eq(savedAttractions.tripId, tripId))
      .orderBy(asc(savedAttractions.createdAt));

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch attractions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const newAttraction = {
      id: generateId(),
      tripId,
      placeId: body.placeId as string,
      name: body.name as string,
      nameJa: (body.nameJa as string) ?? null,
      address: (body.address as string) ?? null,
      rating: (body.rating as number) ?? null,
      reviewCount: (body.reviewCount as number) ?? null,
      city: (body.city as string) ?? null,
      cityName: (body.cityName as string) ?? null,
      googleMapsUrl: (body.googleMapsUrl as string) ?? null,
      lat: (body.lat as number) ?? null,
      lng: (body.lng as number) ?? null,
      source: (body.source as string) ?? "user",
      createdAt: now,
    };

    await db.insert(savedAttractions).values(newAttraction);
    return NextResponse.json({ success: true, data: newAttraction }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save attraction" },
      { status: 500 }
    );
  }
}
