import { NextRequest, NextResponse } from "next/server";
import { getCityById } from "@/lib/data/destinations";
import type { RecommendationResult, RecommendationResponse } from "@/types/recommendation";

const CITY_JA_MAP: Record<string, string> = {
  osaka: "大阪",
  kyoto: "京都",
  tokyo: "東京",
  fukuoka: "福岡",
  nara: "奈良",
  kobe: "神戸",
  hiroshima: "広島",
  sapporo: "札幌",
  okinawa: "沖縄",
  nagoya: "名古屋",
  yokohama: "横浜",
  hakone: "箱根",
};

const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri,places.nationalPhoneNumber,places.types,places.currentOpeningHours";

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

interface PlaceApiResult {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
  nationalPhoneNumber?: string;
  types?: string[];
  currentOpeningHours?: { openNow?: boolean };
}

interface PlacesApiResponse {
  places?: PlaceApiResult[];
}

async function searchPlaces(
  query: string,
  apiKey: string,
  languageCode: string
): Promise<PlaceApiResult[]> {
  const response = await fetch(PLACES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
      "Accept-Language": languageCode,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 20,
      languageCode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data: PlacesApiResponse = await response.json();
  return data.places ?? [];
}

function buildQuery(cityJa: string, type: "food" | "attraction"): string {
  if (type === "food") {
    return `${cityJa} 人気 レストラン`;
  }
  return `${cityJa} 観光スポット`;
}

async function fetchCityRecommendations(
  cityId: string,
  type: "food" | "attraction",
  apiKey: string
): Promise<RecommendationResult[]> {
  const cityJa = CITY_JA_MAP[cityId];
  if (!cityJa) return [];

  const city = getCityById(cityId);
  const cityName = city?.name ?? cityId;
  const query = buildQuery(cityJa, type);

  const [jaPlaces, koPlaces] = await Promise.all([
    searchPlaces(query, apiKey, "ja"),
    searchPlaces(query, apiKey, "ko"),
  ]);

  const koNameMap = new Map<string, string>(
    koPlaces
      .filter((p) => p.id)
      .map((p) => [p.id!, p.displayName?.text ?? ""])
  );

  return jaPlaces
    .filter((place) => place.id && place.location)
    .map((place): RecommendationResult => ({
      placeId: place.id!,
      name: koNameMap.get(place.id!) || place.displayName?.text || "",
      nameJa: place.displayName?.text ?? "",
      address: place.formattedAddress ?? "",
      rating: place.rating ?? 0,
      reviewCount: place.userRatingCount ?? 0,
      phone: place.nationalPhoneNumber,
      city: cityId,
      cityName,
      lat: place.location!.latitude ?? 0,
      lng: place.location!.longitude ?? 0,
      types: place.types ?? [],
      googleMapsUrl: place.googleMapsUri,
      openNow: place.currentOpeningHours?.openNow,
      category: type,
    }));
}

export async function POST(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ results: [], status: "NO_API_KEY" });
  }

  let body: { cities?: unknown; type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ results: [], status: "ERROR" });
  }

  const { cities, type } = body;

  if (
    !Array.isArray(cities) ||
    cities.length === 0 ||
    (type !== "food" && type !== "attraction")
  ) {
    return NextResponse.json({ results: [], status: "ERROR" });
  }

  const validCities = cities.filter(
    (c): c is string => typeof c === "string" && c in CITY_JA_MAP
  );

  try {
    const allResults = await Promise.all(
      validCities.map((cityId) =>
        fetchCityRecommendations(cityId, type as "food" | "attraction", apiKey)
      )
    );

    const results = allResults.flat();
    return NextResponse.json({ results, status: "OK" });
  } catch {
    return NextResponse.json({ results: [], status: "ERROR" });
  }
}
