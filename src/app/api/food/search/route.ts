import { NextRequest, NextResponse } from "next/server";
import type {
  GooglePlaceResult,
  FoodSearchRequest,
  FoodSearchResponse,
} from "@/types/food-search";

interface GooglePlaceCandidate {
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
  id?: string;
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";
  currentOpeningHours?: { openNow?: boolean };
  types?: string[];
}

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

async function searchGooglePlaces(
  query: string,
  apiKey: string,
): Promise<GooglePlaceResult[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  // Japanese results for address/details
  const bodyJa = {
    textQuery: `${query} restaurant`,
    languageCode: "ja",
    maxResultCount: 8,
  };

  const resJa = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri,places.priceLevel,places.currentOpeningHours,places.types",
    },
    body: JSON.stringify(bodyJa),
  });

  if (!resJa.ok) {
    return [];
  }

  const dataJa = await resJa.json();
  const placesJa: GooglePlaceCandidate[] = dataJa.places ?? [];

  // Korean names
  const bodyKo = {
    textQuery: `${query} restaurant`,
    languageCode: "ko",
    maxResultCount: 8,
  };

  const resKo = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify(bodyKo),
  });

  const dataKo = await resKo.json();
  const placesKo: GooglePlaceCandidate[] = dataKo.places ?? [];
  const koNameMap = new Map<string, string>();
  for (const p of placesKo) {
    if (p.id && p.displayName?.text) {
      koNameMap.set(p.id, p.displayName.text);
    }
  }

  return placesJa.map((place) => {
    const jaName = place.displayName?.text ?? "";
    const koName = koNameMap.get(place.id ?? "") ?? jaName;

    return {
      placeId: place.id ?? "",
      name: koName,
      nameJa: jaName,
      rating: place.rating ?? 0,
      userRatingsTotal: place.userRatingCount ?? 0,
      address: place.formattedAddress ?? "",
      priceLevel: place.priceLevel
        ? PRICE_MAP[place.priceLevel] ?? undefined
        : undefined,
      types: (place.types ?? []) as string[],
      lat: place.location?.latitude ?? 0,
      lng: place.location?.longitude ?? 0,
      openNow: place.currentOpeningHours?.openNow,
    };
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<FoodSearchResponse>> {
  try {
    const body = (await request.json()) as FoodSearchRequest;

    if (!body.query || typeof body.query !== "string" || body.query.trim().length < 2) {
      return NextResponse.json({ results: [], status: "NEED_MORE_INPUT" });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { results: [], status: "NO_API_KEY" },
        { status: 500 },
      );
    }

    const results = await searchGooglePlaces(body.query.trim(), apiKey);

    return NextResponse.json({
      results,
      status: results.length > 0 ? "OK" : "ZERO_RESULTS",
    });
  } catch {
    return NextResponse.json(
      { results: [], status: "ERROR" },
      { status: 500 },
    );
  }
}
